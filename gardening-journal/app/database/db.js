import * as SQLite from 'expo-sqlite';

// Create the database connection
const db = SQLite.openDatabaseSync('journal.db');

// Initialize the database tables
export const initDatabase = async () => {
    try {
        // Create journal table
        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS journal (
            journal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            species TEXT,
            fertilizer TEXT NOT NULL,
            watering_time INTEGER NOT NULL,
            date_planted TEXT NOT NULL,
            remind BOOLEAN NOT NULL,
            image_uri TEXT,
        );
        `);
        console.log('Journal table created successfully');

        // Create waterLog table for watering log for each journal entry
        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS waterLog (
            watering_id INTEGER PRIMARY KEY AUTOINCREMENT,
            journal_id INTEGER,
            water_amount TEXT NOT NULL,
            time TEXT NOT NULL,
            date TEXT NOT NULL,
            fertilizer BOOLEAN NOT NULL,
            FOREIGN KEY (journal_id) REFERENCES journal (journal_id) ON DELETE CASCADE
        );
        `);
        console.log('Water Log table created successfully');

        // Create weatherLog table for weather log for each journal entry
        // conditions entry is optional and should only be prompted if inclement-weather is marked true
        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS weatherLog (
            weather_id INTEGER PRIMARY KEY AUTOINCREMENT,
            journal_id INTEGER,
            time TEXT NOT NULL,
            date TEXT NOT NULL,
            climate TEXT NOT NULL,
            inclement_weather BOOLEAN NOT NULL,
            conditions TEXT,
            FOREIGN KEY (journal_id) REFERENCES waterLog (journal_id) ON DELETE CASCADE
        );
        `);
        console.log('Weather Log table created successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

// journal CRUD operations
export const saveEntry = async (plant, waterLog, weatherLog) => {
    try {
        // insert journal entry
            const result = await db.runAsync(
            `INSERT INTO journal (name, description, species, fertilizer, watering_time, date_planted, remind, image_uri)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, 
            [
                journal.name,
                journal.description || '',
                journal.species || '',
                journal.fertilizer,
                journal.watering_time,
                journal.date_planted,
                journal.remind || false, // default to false if not provided
                journal.image_uri || ''
            ]
        );
        
        const plantId = result.lastInsertRowId;
        console.log('Plant entry saved with ID:', plantId);
        
        // insert waterLog
        for (const watering of waterLog) {
            await db.runAsync(
                    `INSERT INTO ingredients (journal_id, water_amount, time, date, fertilizer, water_amount)
                    VALUES (?, ?, ?, ?, ?, ?);`, 
                [
                    plantId,
                    watering.water_amount,
                    watering.time || '',
                    watering.date || '',
                    watering.fertilizer || false, // default to false if not provided
                ]
            );
        }
        
        // insert weatherLog
        for (const weather of weatherLog) {
            await db.runAsync(
                `INSERT INTO steps (journal_id, time, date, climate, inclement_weather, conditions)
                VALUES (?, ?, ?, ?, ?, ?);`, 
                [
                    plantId,
                    weather.time,
                    weather.date,
                    weather.climate,
                    weather.inclement_weather || false, // default to false if not provided
                    weather.conditions || ''
                ]
            );
        }
        
        return plantId;
    }
    catch (error) {
        console.error('Error saving plant entry:', error);
        throw error;
    }
};

export const getJournal = async (searchTerm = '') => {
    try {
        let query = 'SELECT * FROM journal';
        let params = [];
        
        if (searchTerm) {
        query += ' WHERE name LIKE ? OR species LIKE ?';
        params = [`%${searchTerm}%`, `%${searchTerm}%`];
        }
        
        const result = await db.getAllAsync(query, params);
        return result;
    }
    catch (error) {
        console.error('Error retrieving journal info:', error);
        throw error;
    }
};

export const getPlantById = async (journal_id) => {
    try {
        // Get the journal
        const journal = await db.getAllAsync(
            'SELECT * FROM journal WHERE id = ?;',
            [journal_id]
        );
        
        if (journal.length === 0) {
        return null;
        }
        
        const plant = journal[0];
        
        // Get waterLog for this journal entry
        const waterLog = await db.getAllAsync(
            'SELECT * FROM waterLog WHERE journal_id = ? ORDER BY watering_id;',
            [journal_id]
        );
        
        // Get weatherLog for this journal entry
        const weatherLog = await db.getAllAsync(
            'SELECT * FROM weatherLog WHERE journal_id = ? ORDER BY weather_id;',
            [journal_id]
        );
        
        // Combine all data
        return {
            ...plant,
            waterLog,
            weatherLog
        };
    }
    catch (error) {
        console.error('Error retrieving journal entry:', error);
        throw error;
    }
};

export const updateEntry = async (plant, waterLog, weatherLog) => {
    try {
        // Update journal table
        await db.runAsync(
            `UPDATE journal 
            SET name = ?, description = ?, species = ?, fertilizer = ?, watering_time = ?, date_planted = ?, remind = ?, image_uri = ? 
            WHERE journal_id = ?;`,
        [
            journal.name,
            journal.description || '',
            journal.species || '',
            journal.fertilizer,
            journal.watering_time,
            journal.date_planted,
            journal.remind || false, // default to false if not provided
            journal.image_uri || '',
        ]
        );
        
        // Delete existing ingredients and steps to replace with new ones
        await db.runAsync('DELETE FROM waterLog WHERE journal_id = ?;', [journal.journal_id]);
        await db.runAsync('DELETE FROM weatherLog WHERE journal_id = ?;', [journal.journal_id]);
        
        // Insert new ingredients
        for (const watering of waterLog) {
        await db.runAsync(
            `INSERT INTO waterLog (journal_id, water_amount, time, date, fertilizer) 
            VALUES (?, ?, ?, ?, ?);`,
            [
            journal.journal_id,
            watering.water_amount,
            watering.time,
            watering.date,
            watering.fertilizer || false // default to false if not provided
            ]
        );
        }
        
        // Insert new steps
        for (const weather of weatherLog) {
        await db.runAsync(
            `INSERT INTO weatherLog (journal_id, time, date, climate, inclement_weather, conditions) 
            VALUES (?, ?, ?, ?, ?, ?);`,
            [
                journal.journal_id,
                weather.time,
                weather.date,
                weather.climate,
                weather.inclement_weather || false, // default to false if not provided
                weather.conditions || ''
            ]
        );
        }
    }
    catch (error) {
        console.error('Error updating plant entry:', error);
        throw error;
    }
};

export const deleteEntry = async (journal_id) => {
    try {
        await db.runAsync(
            'DELETE FROM recipes WHERE id = ?;',
            [journal_id]);
    }
    catch (error) {
        console.error('Error deleting plant entry:', error);
        throw error;
    }
};

export { db };