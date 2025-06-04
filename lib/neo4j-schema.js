import { executeQuery, executeWriteTransaction } from './neo4j.js';

/**
 * Neo4j Schema Setup for Language Learning Agent Stack
 * 
 * This module defines and creates the necessary node labels, relationship types,
 * constraints, and indexes for the language learning system.
 */

/**
 * Language code mappings for common languages
 */
const LANGUAGE_MAPPINGS = {
  'English': 'en',
  'Spanish': 'es', 
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Chinese': 'zh',
  'Mandarin': 'zh',
  'Arabic': 'ar',
  'Hindi': 'hi',
  'Dutch': 'nl',
  'Swedish': 'sv',
  'Norwegian': 'no',
  'Danish': 'da',
  'Finnish': 'fi',
  'Polish': 'pl',
  'Czech': 'cs',
  'Hungarian': 'hu',
  'Greek': 'el',
  'Turkish': 'tr',
  'Hebrew': 'he',
  'Thai': 'th',
  'Vietnamese': 'vi',
  'Indonesian': 'id',
  'Malay': 'ms',
  'Filipino': 'tl',
  'Swahili': 'sw'
};

/**
 * Get ISO 639-1 language code from language name
 */
export function getLanguageCode(languageName) {
  return LANGUAGE_MAPPINGS[languageName] || languageName.toLowerCase().substring(0, 2);
}

/**
 * Create constraints for the language learning schema
 */
export async function createConstraints() {
  const constraints = [
    // User constraints
    "CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.userId IS UNIQUE",
    
    // Lexeme constraints (composite key: lemma + language)
    "CREATE CONSTRAINT lexeme_unique IF NOT EXISTS FOR (l:Lexeme) REQUIRE (l.lemma, l.language) IS NODE KEY",
    
    // Language constraints
    "CREATE CONSTRAINT language_code_unique IF NOT EXISTS FOR (lang:Language) REQUIRE lang.code IS UNIQUE",
    
    // Conversation constraints
    "CREATE CONSTRAINT conversation_id_unique IF NOT EXISTS FOR (c:Conversation) REQUIRE c.conversationId IS UNIQUE",
    
    // Utterance constraints
    "CREATE CONSTRAINT utterance_id_unique IF NOT EXISTS FOR (utt:Utterance) REQUIRE utt.utteranceId IS UNIQUE",
    
    // SRS Item constraints
    "CREATE CONSTRAINT srs_item_id_unique IF NOT EXISTS FOR (srs:SRS_Item) REQUIRE srs.itemId IS UNIQUE"
  ];

  console.log('🔧 Creating Neo4j constraints...');
  
  for (const constraint of constraints) {
    try {
      await executeQuery(constraint);
      console.log(`✅ Created constraint: ${constraint.split(' ')[2]}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️ Constraint already exists: ${constraint.split(' ')[2]}`);
      } else {
        console.error(`❌ Error creating constraint: ${error.message}`);
        throw error;
      }
    }
  }
}

/**
 * Create indexes for performance optimization
 */
export async function createIndexes() {
  const indexes = [
    // User indexes
    "CREATE INDEX user_target_language_idx IF NOT EXISTS FOR (u:User) ON (u.targetLanguage)",
    "CREATE INDEX user_native_language_idx IF NOT EXISTS FOR (u:User) ON (u.nativeLanguage)",
    
    // SRS Item indexes for efficient querying
    "CREATE INDEX srs_item_next_review_idx IF NOT EXISTS FOR (srs:SRS_Item) ON (srs.nextReview)",
    "CREATE INDEX srs_item_status_idx IF NOT EXISTS FOR (srs:SRS_Item) ON (srs.status)",
    "CREATE INDEX srs_item_user_idx IF NOT EXISTS FOR (srs:SRS_Item) ON (srs.userId)",
    
    // Lexeme indexes
    "CREATE INDEX lexeme_language_idx IF NOT EXISTS FOR (l:Lexeme) ON (l.language)",
    "CREATE INDEX lexeme_pos_idx IF NOT EXISTS FOR (l:Lexeme) ON (l.partOfSpeech)",
    
    // Utterance indexes
    "CREATE INDEX utterance_timestamp_idx IF NOT EXISTS FOR (utt:Utterance) ON (utt.timestamp)",
    "CREATE INDEX utterance_speaker_idx IF NOT EXISTS FOR (utt:Utterance) ON (utt.speaker)",
    
    // Conversation indexes
    "CREATE INDEX conversation_start_time_idx IF NOT EXISTS FOR (c:Conversation) ON (c.startTime)",
    "CREATE INDEX conversation_user_idx IF NOT EXISTS FOR (c:Conversation) ON (c.userId)"
  ];

  console.log('🔧 Creating Neo4j indexes...');
  
  for (const index of indexes) {
    try {
      await executeQuery(index);
      console.log(`✅ Created index: ${index.split(' ')[2]}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️ Index already exists: ${index.split(' ')[2]}`);
      } else {
        console.error(`❌ Error creating index: ${error.message}`);
        throw error;
      }
    }
  }
}

/**
 * Pre-populate language nodes
 */
export async function createLanguageNodes() {
  console.log('🔧 Creating language nodes...');
  
  const languages = Object.entries(LANGUAGE_MAPPINGS);
  
  for (const [name, code] of languages) {
    try {
      await executeQuery(
        "MERGE (l:Language {code: $code}) ON CREATE SET l.name = $name",
        { code, name }
      );
    } catch (error) {
      console.error(`❌ Error creating language node for ${name}: ${error.message}`);
    }
  }
  
  console.log(`✅ Created ${languages.length} language nodes`);
}

/**
 * Initialize the complete Neo4j schema
 */
export async function initializeSchema() {
  try {
    console.log('🚀 Initializing Neo4j schema for Language Learning Agent Stack...');
    
    await createConstraints();
    await createIndexes();
    await createLanguageNodes();
    
    console.log('✅ Neo4j schema initialization completed successfully!');
    return { success: true, message: 'Schema initialized successfully' };
    
  } catch (error) {
    console.error('❌ Error initializing Neo4j schema:', error);
    throw error;
  }
}

/**
 * Verify schema setup
 */
export async function verifySchema() {
  try {
    console.log('🔍 Verifying Neo4j schema...');
    
    // Check constraints
    const constraints = await executeQuery("SHOW CONSTRAINTS");
    console.log(`📊 Found ${constraints.length} constraints`);
    
    // Check indexes
    const indexes = await executeQuery("SHOW INDEXES");
    console.log(`📊 Found ${indexes.length} indexes`);
    
    // Check language nodes
    const languages = await executeQuery("MATCH (l:Language) RETURN count(l) as count");
    console.log(`📊 Found ${languages[0]?.count || 0} language nodes`);
    
    return {
      success: true,
      constraints: constraints.length,
      indexes: indexes.length,
      languages: languages[0]?.count || 0
    };
    
  } catch (error) {
    console.error('❌ Error verifying schema:', error);
    throw error;
  }
}
