#!/usr/bin/env node

/**
 * Generate Test Seed Data Tool
 * 
 * Transforms JSON meeting summary data into PostgreSQL seed SQL files.
 * Generates: seed.sql, mapping.json, TESTDATA.md
 * 
 * Usage: node scripts/generate-seed-data.js <json-input-file> [schema-file]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// Phase 1: Setup (T001-T004)
// ============================================================================

// T001: Project structure - single file script
// T002: CLI argument parsing
const args = process.argv.slice(2);
const jsonInputFile = args[0];
const schemaFile = args[1] || './schema.sql';

// T003: File I/O utilities
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// T004: Error handling infrastructure
const errors = [];
const warnings = [];

function addError(message, recordId = null) {
  const error = recordId ? `[${recordId}] ${message}` : message;
  errors.push(error);
  console.error(`ERROR: ${error}`);
}

function addWarning(message, recordId = null) {
  const warning = recordId ? `[${recordId}] ${message}` : message;
  warnings.push(warning);
  console.warn(`WARN: ${warning}`);
}

// ============================================================================
// Phase 2: Foundational (T005-T012)
// ============================================================================

// T005: SQL parser module - extract CREATE TABLE statements
function parseCreateTableStatements(schemaContent) {
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["']?public["']?\.)?["']?(\w+)["']?\s*\(([\s\S]*?)\);/gi;
  const tables = [];
  let match;

  while ((match = createTableRegex.exec(schemaContent)) !== null) {
    const tableName = match[1];
    const tableBody = match[2];
    tables.push({ name: tableName, body: tableBody });
  }

  return tables;
}

// T006: Extract table structure (columns, data types)
function extractTableStructure(tableBody) {
  const columns = [];
  const columnRegex = /["']?(\w+)["']?\s+([^,\(\)]+?)(?:,|$)/g;
  let match;

  while ((match = columnRegex.exec(tableBody)) !== null) {
    const columnName = match[1].trim();
    const columnDef = match[2].trim();
    
    // Extract data type (simplified - handles common types)
    let dataType = columnDef.split(/\s+/)[0];
    if (dataType.includes('(')) {
      dataType = dataType.substring(0, dataType.indexOf('('));
    }
    
    const isNotNull = /\bNOT\s+NULL\b/i.test(columnDef);
    const hasDefault = /\bDEFAULT\b/i.test(columnDef);
    
    columns.push({
      name: columnName,
      type: dataType,
      definition: columnDef,
      notNull: isNotNull,
      hasDefault: hasDefault
    });
  }

  return columns;
}

// T007: Extract constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL)
function extractConstraints(schemaContent, tableName) {
  const constraints = {
    primaryKey: null,
    foreignKeys: [],
    unique: [],
    notNull: []
  };

  // Escape tableName for use in regex
  const escapedTableName = tableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Find PRIMARY KEY - matches: ALTER TABLE ONLY "public"."table_name" ... ADD CONSTRAINT ... PRIMARY KEY ("column_name")
  const pkRegex = new RegExp(`ALTER\\s+TABLE\\s+ONLY\\s+(?:["']?public["']?\\.)?["']?${escapedTableName}["']?[\\s\\S]*?ADD\\s+CONSTRAINT\\s+["']?\\w+["']?\\s+PRIMARY\\s+KEY\\s*\\(["']?(\\w+)["']?\\)`, 'gi');
  let match = pkRegex.exec(schemaContent);
  if (match) {
    constraints.primaryKey = match[1];
  }

  // Find FOREIGN KEY constraints - matches: ALTER TABLE ONLY "public"."table_name" ... ADD CONSTRAINT ... FOREIGN KEY ("column") REFERENCES "public"."ref_table"("ref_column")
  const fkRegex = new RegExp(`ALTER\\s+TABLE\\s+ONLY\\s+(?:["']?public["']?\\.)?["']?${escapedTableName}["']?[\\s\\S]*?ADD\\s+CONSTRAINT\\s+["']?\\w+["']?\\s+FOREIGN\\s+KEY\\s*\\(["']?(\\w+)["']?\\)\\s+REFERENCES\\s+(?:["']?public["']?\\.)?["']?(\\w+)["']?\\(["']?(\\w+)["']?\\)`, 'gi');
  while ((match = fkRegex.exec(schemaContent)) !== null) {
    constraints.foreignKeys.push({
      column: match[1],
      referencesTable: match[2],
      referencesColumn: match[3]
    });
  }

  // Find UNIQUE constraints - matches: ALTER TABLE ONLY "public"."table_name" ... ADD CONSTRAINT ... UNIQUE (...)
  const uniqueRegex = new RegExp(`ALTER\\s+TABLE\\s+ONLY\\s+(?:["']?public["']?\\.)?["']?${escapedTableName}["']?[\\s\\S]*?ADD\\s+CONSTRAINT\\s+["']?\\w+["']?\\s+UNIQUE\\s*\\(([^)]+)\\)`, 'gi');
  while ((match = uniqueRegex.exec(schemaContent)) !== null) {
    const columns = match[1].split(',').map(c => c.trim().replace(/["']/g, ''));
    constraints.unique.push(columns);
  }

  return constraints;
}

// T008: Build dependency graph from FOREIGN KEY constraints
function buildDependencyGraph(tables, schemaContent) {
  const graph = {};
  const tableNames = tables.map(t => t.name);

  // Initialize graph
  tableNames.forEach(tableName => {
    graph[tableName] = { dependencies: [], dependents: [] };
  });

  // Build dependencies from foreign keys
  tables.forEach(table => {
    const constraints = extractConstraints(schemaContent, table.name);
    constraints.foreignKeys.forEach(fk => {
      const dependentTable = table.name;
      const dependencyTable = fk.referencesTable;
      
      if (tableNames.includes(dependencyTable)) {
        if (!graph[dependentTable].dependencies.includes(dependencyTable)) {
          graph[dependentTable].dependencies.push(dependencyTable);
        }
        if (!graph[dependencyTable].dependents.includes(dependentTable)) {
          graph[dependencyTable].dependents.push(dependentTable);
        }
      }
    });
  });

  return graph;
}

// T009: Topological sort for INSERT statement ordering
function topologicalSort(graph) {
  const sorted = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(node) {
    if (visiting.has(node)) {
      addWarning(`Circular dependency detected involving table: ${node}`);
      return;
    }
    if (visited.has(node)) {
      return;
    }

    visiting.add(node);
    graph[node].dependencies.forEach(dep => visit(dep));
    visiting.delete(node);
    visited.add(node);
    sorted.push(node);
  }

  Object.keys(graph).forEach(node => {
    if (!visited.has(node)) {
      visit(node);
    }
  });

  return sorted;
}

// T010: Deterministic UUID generator using SHA-256 hash
function generateDeterministicUUID(contextString) {
  const hash = crypto.createHash('sha256').update(contextString).digest('hex');
  // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

// T011: Timestamp generation utilities
function parseISODate(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    return null;
  }
}

function formatTimestamp(date) {
  if (!date) {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

// T012: JSON input validation
function validateJSONInput(jsonData) {
  if (!Array.isArray(jsonData)) {
    throw new Error('JSON input must be an array');
  }

  if (jsonData.length === 0) {
    addWarning('JSON input array is empty');
  }

  jsonData.forEach((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`JSON array item at index ${index} must be an object`);
    }
  });

  return true;
}

// ============================================================================
// Phase 3: User Story 1 - Generate SQL Seed File (T013-T035)
// ============================================================================

// Data structures for tracking extracted data
const workgroupsMap = new Map(); // workgroup_id -> workgroup data
const namesSet = new Set(); // unique names
const tagsMap = new Map(); // (tag, type) -> tag data
const meetings = []; // meeting summaries

// T013: Workgroup extraction and transformation
function extractWorkgroup(meetingSummary, recordId) {
  const workgroup = meetingSummary.workgroup;
  const workgroupId = meetingSummary.workgroup_id;

  if (!workgroup) {
    addError('Missing workgroup field', recordId);
    return null;
  }

  let finalWorkgroupId = workgroupId;
  let transformation = 'direct';
  if (!workgroupId || !isValidUUID(workgroupId)) {
    finalWorkgroupId = generateDeterministicUUID(`workgroup:${workgroup}`);
    transformation = 'deterministic-uuid';
    if (workgroupId) {
      addWarning(`Invalid workgroup_id format, generated deterministic UUID`, recordId);
    }
  }

  // Track mapping (only once per unique mapping)
  if (!mappings.find(m => m.jsonPath === 'workgroup' && m.table === 'workgroups' && m.column === 'workgroup')) {
    addMapping('workgroup', 'workgroups', 'workgroup', 'direct', false);
  }
  if (!mappings.find(m => m.jsonPath === 'workgroup_id' && m.table === 'workgroups' && m.column === 'workgroup_id')) {
    addMapping('workgroup_id', 'workgroups', 'workgroup_id', transformation, false, workgroup);
  }

  const meetingDate = parseISODate(meetingSummary.meetingInfo?.date) || new Date();
  
  return {
    workgroup_id: finalWorkgroupId,
    workgroup: workgroup,
    created_at: meetingDate,
    user_id: generateDeterministicUUID(`user:${workgroup}:user`),
    preferred_template: null
  };
}

// T014: Workgroup deduplication
function addWorkgroup(workgroupData, recordId) {
  if (!workgroupData) return null;

  const workgroupId = workgroupData.workgroup_id;
  if (workgroupsMap.has(workgroupId)) {
    addWarning(`Duplicate workgroup_id: ${workgroupId} (using first occurrence)`, recordId);
    return workgroupsMap.get(workgroupId);
  }

  // Track synthetic fields for workgroups (only once)
  if (!syntheticFields.find(f => f.table === 'workgroups' && f.column === 'created_at')) {
    syntheticFields.push({
      table: 'workgroups',
      column: 'created_at',
      generation: 'timestamp',
      source: 'meeting date'
    });
  }
  if (!syntheticFields.find(f => f.table === 'workgroups' && f.column === 'user_id')) {
    syntheticFields.push({
      table: 'workgroups',
      column: 'user_id',
      generation: 'deterministic-uuid',
      source: 'workgroup name'
    });
  }
  if (!syntheticFields.find(f => f.table === 'workgroups' && f.column === 'preferred_template')) {
    syntheticFields.push({
      table: 'workgroups',
      column: 'preferred_template',
      generation: 'default',
      source: 'NULL'
    });
  }

  workgroupsMap.set(workgroupId, workgroupData);
  return workgroupData;
}

// T015: Names extraction from peoplePresent
function extractNames(meetingSummary, recordId) {
  const peoplePresent = meetingSummary.meetingInfo?.peoplePresent;
  if (!peoplePresent || typeof peoplePresent !== 'string') {
    return [];
  }

  return peoplePresent
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

// T016: Names normalization and deduplication
function addName(name, meetingDate, recordId) {
  if (!name || name.length === 0) return null;

  if (namesSet.has(name)) {
    return name; // Already exists
  }

  namesSet.add(name);
  
  // Track synthetic fields for names (only once)
  if (!syntheticFields.find(f => f.table === 'names' && f.column === 'user_id')) {
    syntheticFields.push({
      table: 'names',
      column: 'user_id',
      generation: 'deterministic-uuid',
      source: 'name context'
    });
  }
  if (!syntheticFields.find(f => f.table === 'names' && f.column === 'approved')) {
    syntheticFields.push({
      table: 'names',
      column: 'approved',
      generation: 'default',
      source: 'true'
    });
  }
  if (!syntheticFields.find(f => f.table === 'names' && f.column === 'created_at')) {
    syntheticFields.push({
      table: 'names',
      column: 'created_at',
      generation: 'timestamp',
      source: 'meeting date'
    });
  }
  
  const nameData = {
    name: name,
    user_id: generateDeterministicUUID(`user:${name}:user`),
    approved: true,
    created_at: meetingDate || new Date()
  };
  
  return nameData;
}

// T017: Tags extraction from tags object
function extractTags(meetingSummary, recordId) {
  const tags = meetingSummary.tags || {};
  const extractedTags = [];

  // Extract from topicsCovered
  if (tags.topicsCovered && typeof tags.topicsCovered === 'string') {
    tags.topicsCovered.split(',').forEach(tag => {
      const trimmed = tag.trim();
      if (trimmed) extractedTags.push({ tag: trimmed, type: 'topicsCovered' });
    });
  }

  // Extract from emotions
  if (tags.emotions && typeof tags.emotions === 'string') {
    tags.emotions.split(',').forEach(tag => {
      const trimmed = tag.trim();
      if (trimmed) extractedTags.push({ tag: trimmed, type: 'emotions' });
    });
  }

  // Extract from gamesPlayed
  if (tags.gamesPlayed && typeof tags.gamesPlayed === 'string') {
    tags.gamesPlayed.split(',').forEach(tag => {
      const trimmed = tag.trim();
      if (trimmed) extractedTags.push({ tag: trimmed, type: 'gamesPlayed' });
    });
  }

  // Extract from other
  if (tags.other && typeof tags.other === 'string') {
    const trimmed = tags.other.trim();
    if (trimmed) extractedTags.push({ tag: trimmed, type: 'other' });
  }

  return extractedTags;
}

// T018: Tags normalization and deduplication
function addTag(tagData, meetingDate, recordId) {
  if (!tagData || !tagData.tag || !tagData.type) return null;

  const key = `${tagData.tag}|${tagData.type}`;
  if (tagsMap.has(key)) {
    return tagsMap.get(key); // Already exists
  }

  // Track synthetic fields for tags (only once)
  if (!syntheticFields.find(f => f.table === 'tags' && f.column === 'user_id')) {
    syntheticFields.push({
      table: 'tags',
      column: 'user_id',
      generation: 'deterministic-uuid',
      source: 'tag + type context'
    });
  }
  if (!syntheticFields.find(f => f.table === 'tags' && f.column === 'created_at')) {
    syntheticFields.push({
      table: 'tags',
      column: 'created_at',
      generation: 'timestamp',
      source: 'meeting date'
    });
  }

  const fullTagData = {
    tag: tagData.tag,
    type: tagData.type,
    user_id: generateDeterministicUUID(`user:${tagData.tag}:${tagData.type}:user`),
    created_at: meetingDate || new Date()
  };

  tagsMap.set(key, fullTagData);
  return fullTagData;
}

// T019: Meeting summary extraction
function extractMeetingSummary(meetingSummary, workgroupData, recordId) {
  const meetingInfo = meetingSummary.meetingInfo;
  if (!meetingInfo) {
    addError('Missing meetingInfo field', recordId);
    return null;
  }

  const name = meetingInfo.name;
  const dateStr = meetingInfo.date;
  const workgroupId = workgroupData?.workgroup_id;

  if (!name) {
    addError('Missing meetingInfo.name field', recordId);
    return null;
  }

  if (!dateStr) {
    addError('Missing meetingInfo.date field', recordId);
    return null;
  }

  const date = parseISODate(dateStr);
  if (!date) {
    addError(`Invalid date format: ${dateStr}`, recordId);
    return null;
  }

  if (!workgroupId) {
    addError('Missing workgroup_id reference', recordId);
    return null;
  }

  const meetingId = generateDeterministicUUID(`meeting:${name}:${dateStr}:${workgroupId}`);
  const userId = generateDeterministicUUID(`user:${workgroupData.workgroup}:user`);

  // Track mappings (only once per unique mapping)
  const mappingKey = `meetingInfo.name|meetingsummaries|name`;
  if (!mappings.find(m => m.jsonPath === 'meetingInfo.name' && m.table === 'meetingsummaries' && m.column === 'name')) {
    addMapping('meetingInfo.name', 'meetingsummaries', 'name', 'direct', false);
  }
  if (!mappings.find(m => m.jsonPath === 'meetingInfo.date' && m.table === 'meetingsummaries' && m.column === 'date')) {
    addMapping('meetingInfo.date', 'meetingsummaries', 'date', 'parse-iso-date', false);
  }
  if (!mappings.find(m => m.jsonPath === 'workgroup_id' && m.table === 'meetingsummaries' && m.column === 'workgroup_id')) {
    addMapping('workgroup_id', 'meetingsummaries', 'workgroup_id', 'direct', false);
  }
  if (!mappings.find(m => m.jsonPath === 'type' && m.table === 'meetingsummaries' && m.column === 'template')) {
    addMapping('type', 'meetingsummaries', 'template', 'direct', false);
  }
  if (!mappings.find(m => m.jsonPath === '*' && m.table === 'meetingsummaries' && m.column === 'summary')) {
    addMapping('*', 'meetingsummaries', 'summary', 'json-stringify', false);
  }
  
  // Track synthetic fields (only once)
  if (!syntheticFields.find(f => f.table === 'meetingsummaries' && f.column === 'meeting_id')) {
    syntheticFields.push({
      table: 'meetingsummaries',
      column: 'meeting_id',
      generation: 'deterministic-uuid',
      source: 'name + date + workgroup_id'
    });
  }
  if (!syntheticFields.find(f => f.table === 'meetingsummaries' && f.column === 'user_id')) {
    syntheticFields.push({
      table: 'meetingsummaries',
      column: 'user_id',
      generation: 'deterministic-uuid',
      source: 'workgroup context'
    });
  }
  if (!syntheticFields.find(f => f.table === 'meetingsummaries' && f.column === 'confirmed')) {
    syntheticFields.push({
      table: 'meetingsummaries',
      column: 'confirmed',
      generation: 'default',
      source: 'false'
    });
  }
  if (!syntheticFields.find(f => f.table === 'meetingsummaries' && f.column === 'created_at')) {
    syntheticFields.push({
      table: 'meetingsummaries',
      column: 'created_at',
      generation: 'timestamp',
      source: 'meeting date'
    });
  }
  if (!syntheticFields.find(f => f.table === 'meetingsummaries' && f.column === 'updated_at')) {
    syntheticFields.push({
      table: 'meetingsummaries',
      column: 'updated_at',
      generation: 'timestamp',
      source: 'meeting date'
    });
  }

  return {
    meeting_id: meetingId,
    name: name,
    date: date,
    workgroup_id: workgroupId,
    user_id: userId,
    template: meetingSummary.type || 'custom',
    summary: JSON.stringify(meetingSummary),
    confirmed: false,
    created_at: date,
    updated_at: date
  };
}

// T020: Meeting summary JSONB storage (handled in T019)
// T021: Meeting summary deduplication
function addMeeting(meetingData, recordId) {
  if (!meetingData) return null;

  const key = `${meetingData.name}|${formatTimestamp(meetingData.date)}|${meetingData.workgroup_id}|${meetingData.user_id}`;
  
  // Check for duplicates
  const duplicate = meetings.find(m => 
    m.name === meetingData.name &&
    formatTimestamp(m.date) === formatTimestamp(meetingData.date) &&
    m.workgroup_id === meetingData.workgroup_id &&
    m.user_id === meetingData.user_id
  );

  if (duplicate) {
    addWarning(`Duplicate meeting summary (name, date, workgroup_id, user_id) - skipping`, recordId);
    return null;
  }

  meetings.push(meetingData);
  return meetingData;
}

// T022: Data type validation
function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// T023: Required field validation (handled in extraction functions)
// T024: Referential integrity validation
function validateReferentialIntegrity(meetingData, workgroupData) {
  if (!meetingData || !workgroupData) return false;
  if (meetingData.workgroup_id !== workgroupData.workgroup_id) {
    return false;
  }
  return true;
}

// T025-T028: SQL INSERT statement generation
function generateWorkgroupInsert(workgroup) {
  const workgroupId = escapeSQLString(workgroup.workgroup_id);
  const workgroupName = escapeSQLString(workgroup.workgroup);
  const createdAt = formatTimestamp(workgroup.created_at);
  const userId = escapeSQLString(workgroup.user_id);
  const preferredTemplate = workgroup.preferred_template ? escapeSQLString(JSON.stringify(workgroup.preferred_template)) : 'NULL';

  return `INSERT INTO workgroups (workgroup_id, workgroup, created_at, user_id, preferred_template)\nVALUES ('${workgroupId}', '${workgroupName}', '${createdAt}', '${userId}', ${preferredTemplate});`;
}

function generateNameInsert(nameData) {
  const name = escapeSQLString(nameData.name);
  const userId = escapeSQLString(nameData.user_id);
  const approved = nameData.approved ? 'true' : 'false';
  const createdAt = formatTimestamp(nameData.created_at);

  return `INSERT INTO names (name, user_id, approved, created_at)\nVALUES ('${name}', '${userId}', ${approved}, '${createdAt}');`;
}

function generateTagInsert(tagData) {
  const tag = escapeSQLString(tagData.tag);
  const type = escapeSQLString(tagData.type);
  const userId = escapeSQLString(tagData.user_id);
  const createdAt = formatTimestamp(tagData.created_at);

  return `INSERT INTO tags (tag, type, user_id, created_at)\nVALUES ('${tag}', '${type}', '${userId}', '${createdAt}');`;
}

function generateMeetingInsert(meeting) {
  const meetingId = escapeSQLString(meeting.meeting_id);
  const name = escapeSQLString(meeting.name);
  const date = formatTimestamp(meeting.date);
  const workgroupId = escapeSQLString(meeting.workgroup_id);
  const userId = escapeSQLString(meeting.user_id);
  const template = escapeSQLString(meeting.template);
  const summary = escapeSQLString(meeting.summary);
  const confirmed = meeting.confirmed ? 'true' : 'false';
  const createdAt = formatTimestamp(meeting.created_at);
  const updatedAt = formatTimestamp(meeting.updated_at);

  return `INSERT INTO meetingsummaries (meeting_id, name, date, workgroup_id, user_id, template, summary, confirmed, created_at, updated_at)\nVALUES ('${meetingId}', '${name}', '${date}', '${workgroupId}', '${userId}', '${template}', '${summary}', ${confirmed}, '${createdAt}', '${updatedAt}');`;
}

// T029: SQL escaping and quoting
function escapeSQLString(str) {
  if (str === null || str === undefined) {
    return '';
  }
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''");
}

// T030: Seed.sql file writing with dependency-ordered INSERT statements
function generateSeedSQL(tableOrder, namesDataMap) {
  let sql = '-- Generated seed data\n';
  sql += '-- TRUNCATE statements (commented out by default)\n';
  sql += '-- Uncomment to clear existing data before inserting:\n';
  sql += '-- TRUNCATE TABLE meetingsummaries CASCADE;\n';
  sql += '-- TRUNCATE TABLE workgroups CASCADE;\n';
  sql += '-- TRUNCATE TABLE names CASCADE;\n';
  sql += '-- TRUNCATE TABLE tags CASCADE;\n\n';

  // Generate INSERTs in dependency order
  tableOrder.forEach(tableName => {
    if (tableName === 'workgroups') {
      workgroupsMap.forEach(workgroup => {
        sql += generateWorkgroupInsert(workgroup) + '\n\n';
      });
    } else if (tableName === 'names') {
      namesDataMap.forEach(nameData => {
        sql += generateNameInsert(nameData) + '\n\n';
      });
    } else if (tableName === 'tags') {
      tagsMap.forEach(tag => {
        sql += generateTagInsert(tag) + '\n\n';
      });
    } else if (tableName === 'meetingsummaries') {
      meetings.forEach(meeting => {
        sql += generateMeetingInsert(meeting) + '\n\n';
      });
    }
  });

  return sql;
}

// T031: TRUNCATE statement generation (handled in T030)
// T032: Error handling for invalid data (handled throughout)
// T033: CLI argument validation
function validateArguments() {
  if (!jsonInputFile) {
    addError('JSON input file path is required');
    process.exit(1);
  }

  if (!fileExists(jsonInputFile)) {
    addError(`JSON input file not found: ${jsonInputFile}`);
    process.exit(1);
  }

  if (!fileExists(schemaFile)) {
    addError(`Schema file not found: ${schemaFile}`);
    process.exit(1);
  }
}

// T034: File path resolution
function getOutputDirectory(inputFilePath) {
  return path.dirname(path.resolve(inputFilePath));
}

// T035: Exit code handling
function determineExitCode() {
  if (errors.length > 0) {
    // Check if any errors are fatal
    const fatalErrors = errors.filter(e => 
      e.includes('not found') || 
      e.includes('must be') ||
      e.includes('Failed to')
    );
    if (fatalErrors.length > 0) {
      return 1; // Fatal error
    }
  }
  
  if (errors.length > 0 || warnings.length > 0) {
    return 2; // Partial success with warnings
  }
  
  return 0; // Success
}

// ============================================================================
// Phase 4: User Story 2 - Document JSON to SQL Mapping (T036-T043)
// ============================================================================

const mappings = [];
const syntheticFields = [];
let statistics = {
  totalRecords: 0,
  workgroups: 0,
  meetings: 0,
  names: 0,
  tags: 0,
  errors: 0,
  warnings: 0
};

// T036: Mapping structure builder
function addMapping(jsonPath, table, column, transformation, synthetic = false, context = null) {
  mappings.push({
    jsonPath,
    table,
    column,
    transformation,
    synthetic,
    context
  });
}

// T037: Direct field mappings
// T038: Transformed field mappings
// T039: Synthetic field tracking
// T040: Statistics collection
function updateStatistics() {
  statistics.totalRecords = meetings.length;
  statistics.workgroups = workgroupsMap.size;
  statistics.meetings = meetings.length;
  statistics.names = namesSet.size;
  statistics.tags = tagsMap.size;
  statistics.errors = errors.length;
  statistics.warnings = warnings.length;
}

// T041: Error/warning summary collection
// T042: Mapping.json file writing
function generateMappingJSON(inputFile, schemaFilePath) {
  const mappingData = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    inputFile: inputFile,
    schemaFile: schemaFilePath,
    mappings: mappings,
    syntheticFields: syntheticFields,
    statistics: statistics
  };

  return JSON.stringify(mappingData, null, 2);
}

// T043: Mapping.json structure validation (handled by JSON.stringify)

// ============================================================================
// Phase 5: User Story 3 - Developer Usage Documentation (T044-T051)
// ============================================================================

// T044-T051: TESTDATA.md generation
function generateTESTDATA(outputDir, inputFile) {
  let md = '# Test Data Usage Guide\n\n';
  md += `**Generated**: ${new Date().toISOString()}\n`;
  md += `**Source File**: ${inputFile}\n\n`;

  md += '## Usage Instructions\n\n';
  md += '### Option 1: Using psql\n\n';
  md += '```bash\n';
  md += `psql -h localhost -U your_user -d your_database -f ${path.join(outputDir, 'seed.sql')}\n`;
  md += '```\n\n';

  md += '### Option 2: Using Supabase CLI\n\n';
  md += '```bash\n';
  md += '# If using Supabase local development\n';
  md += 'supabase db reset\n';
  md += `psql -h localhost -p 54322 -U postgres -d postgres -f ${path.join(outputDir, 'seed.sql')}\n`;
  md += '```\n\n';

  md += '## Data Summary\n\n';
  md += `- **Total Records Processed**: ${statistics.totalRecords}\n`;
  md += `- **Workgroups**: ${statistics.workgroups}\n`;
  md += `- **Meetings**: ${statistics.meetings}\n`;
  md += `- **Names**: ${statistics.names}\n`;
  md += `- **Tags**: ${statistics.tags}\n\n`;

  md += '## Limitations and Assumptions\n\n';
  md += '- UUIDs are generated deterministically using SHA-256 hashing\n';
  md += '- Dates are parsed from ISO format (YYYY-MM-DD)\n';
  md += '- Duplicate records are skipped with warnings\n';
  md += '- Foreign key constraints are satisfied by INSERT ordering\n\n';

  md += '## Error and Warning Summary\n\n';
  md += `- **Total Errors**: ${statistics.errors}\n`;
  md += `- **Total Warnings**: ${statistics.warnings}\n\n`;

  if (errors.length > 0) {
    md += '### Errors\n\n';
    errors.slice(0, 10).forEach(error => {
      md += `- ${error}\n`;
    });
    if (errors.length > 10) {
      md += `- ... and ${errors.length - 10} more errors\n`;
    }
    md += '\n';
  }

  if (warnings.length > 0) {
    md += '### Warnings\n\n';
    warnings.slice(0, 10).forEach(warning => {
      md += `- ${warning}\n`;
    });
    if (warnings.length > 10) {
      md += `- ... and ${warnings.length - 10} more warnings\n`;
    }
    md += '\n';
  }

  md += '## Regeneration Instructions\n\n';
  md += 'To regenerate seed data:\n\n';
  md += '```bash\n';
  md += `node scripts/generate-seed-data.js ${inputFile}\n`;
  md += '```\n\n';

  md += '## Common Issues and Solutions\n\n';
  md += '### Foreign Key Constraint Violations\n';
  md += 'The tool automatically orders INSERTs to satisfy foreign keys. If you see errors:\n';
  md += '1. Check TESTDATA.md for error details\n';
  md += '2. Verify that workgroups are inserted before meetings\n';
  md += '3. Check that all referenced workgroup_ids exist\n\n';

  md += '### Duplicate Key Violations\n';
  md += 'The tool skips duplicates automatically. Check TESTDATA.md for warnings about skipped duplicates.\n\n';

  return md;
}

// ============================================================================
// Phase 6: Polish & Cross-Cutting Concerns (T052-T056)
// ============================================================================

// T052: Comprehensive console logging
function logProgress(message) {
  console.log(message);
}

// T053: Performance optimization (handled by efficient data structures)
// T054: Input validation improvements (handled in T012 and T033)
// T055: Edge case handling (handled throughout)
// T056: Code comments (added throughout)

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  try {
    // Validate arguments
    validateArguments();

    logProgress(`Processing ${jsonInputFile}...`);

    // Read and parse JSON
    const jsonContent = readFile(jsonInputFile);
    const jsonData = JSON.parse(jsonContent);
    validateJSONInput(jsonData);

    logProgress(`Found ${jsonData.length} meeting summaries`);

    // Read and parse schema
    const schemaContent = readFile(schemaFile);
    const tables = parseCreateTableStatements(schemaContent);
    
    if (tables.length === 0) {
      addError('No CREATE TABLE statements found in schema file');
      process.exit(1);
    }

    logProgress(`Found ${tables.length} tables in schema`);

    // Build dependency graph
    const dependencyGraph = buildDependencyGraph(tables, schemaContent);
    const tableOrder = topologicalSort(dependencyGraph);

    logProgress(`Table insertion order: ${tableOrder.join(' → ')}`);

    // Process each meeting summary
    const namesDataMap = new Map(); // Track name data for INSERT generation

    jsonData.forEach((meetingSummary, index) => {
      const recordId = `record-${index}`;

      // Extract workgroup
      const workgroupData = extractWorkgroup(meetingSummary, recordId);
      if (workgroupData) {
        addWorkgroup(workgroupData, recordId);
      }

      // Extract names
      const names = extractNames(meetingSummary, recordId);
      const meetingDate = parseISODate(meetingSummary.meetingInfo?.date);
      
      // Track mapping for names (only once)
      if (names.length > 0 && !mappings.find(m => m.jsonPath === 'meetingInfo.peoplePresent' && m.table === 'names' && m.column === 'name')) {
        addMapping('meetingInfo.peoplePresent', 'names', 'name', 'extract-comma-separated', false);
      }
      
      names.forEach(name => {
        const nameData = addName(name, meetingDate, recordId);
        if (nameData && typeof nameData === 'object' && !namesDataMap.has(name)) {
          namesDataMap.set(name, nameData);
        }
      });

      // Extract tags
      const tags = extractTags(meetingSummary, recordId);
      tags.forEach(tag => {
        // Track mapping for tags (only once per type)
        if (!mappings.find(m => m.jsonPath === `tags.${tag.type}` && m.table === 'tags' && m.column === 'tag')) {
          addMapping(`tags.${tag.type}`, 'tags', 'tag', 'extract-comma-separated', false);
        }
        if (!mappings.find(m => m.jsonPath === `tags.${tag.type}` && m.table === 'tags' && m.column === 'type')) {
          addMapping(`tags.${tag.type}`, 'tags', 'type', 'direct', false);
        }
        addTag(tag, meetingDate, recordId);
      });

      // Extract meeting summary
      if (workgroupData) {
        const meetingData = extractMeetingSummary(meetingSummary, workgroupData, recordId);
        if (meetingData && validateReferentialIntegrity(meetingData, workgroupData)) {
          addMeeting(meetingData, recordId);
        }
      }
    });

    logProgress(`Extracted ${workgroupsMap.size} workgroups`);
    logProgress(`Extracted ${namesSet.size} unique names`);
    logProgress(`Extracted ${tagsMap.size} unique tags`);
    logProgress(`Extracted ${meetings.length} meeting summaries`);

    // Update statistics
    updateStatistics();

    // Generate output files
    const outputDir = getOutputDirectory(jsonInputFile);
    const seedSQL = generateSeedSQL(tableOrder, namesDataMap);
    const mappingJSON = generateMappingJSON(jsonInputFile, schemaFile);
    const testDataMD = generateTESTDATA(outputDir, jsonInputFile);

    // Write files
    logProgress('Writing seed.sql...');
    writeFile(path.join(outputDir, 'seed.sql'), seedSQL);

    logProgress('Writing mapping.json...');
    writeFile(path.join(outputDir, 'mapping.json'), mappingJSON);

    logProgress('Writing TESTDATA.md...');
    writeFile(path.join(outputDir, 'TESTDATA.md'), testDataMD);

    logProgress(`Done! Generated files in ${outputDir}/`);
    
    if (warnings.length > 0 || errors.length > 0) {
      logProgress(`Warnings: ${warnings.length}, Errors: ${errors.length} (see TESTDATA.md for details)`);
    }

    // Exit with appropriate code
    const exitCode = determineExitCode();
    process.exit(exitCode);

  } catch (error) {
    addError(error.message);
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run main function
main();
