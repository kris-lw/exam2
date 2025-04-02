// app/index.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity,
         TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getJournal, initDatabase } from './database/db';

export default function HomeScreen() {
  const [journal, setJournal] = useState([]);
  const [filteredJournal, setFilteredJournal] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect - This useEffect is designed to load recipe data when the component first mounts.
  useEffect(() => {
    initDatabase();
    loadJournal();
  }, []); // The empty array as the second argument means this effect will only run once after the initial render of the component

  //Synchronous operations block execution until they complete
  //API calls, file operations, and database queries take unpredictable amounts of time
  // that's why we use async. We need to use try catch because it is outside the scope of the system
  const loadJournal = async () => {
    try {
      setLoading(true); // Similar to a session variable
      const journalData = await getJournal(); //makes an asynchronous call to get recipe data.
      setJournal(journalData);
      setFilteredJournal(journalData);
    }
    catch (error) {
      console.error('Error loading journal:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text) {
      const filtered = journal.filter(
        entry => 
          entry.name.toLowerCase().includes(text.toLowerCase()) ||
          entry.species.toLowerCase().includes(text.toLowerCase()) ||
          entry.fertilizer.toLowerCase().includes(text.toLowerCase()) ||
          entry.watering_time.includes(parseInt(text, 10)) ||
          entry.date_planted.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredJournal(filtered);
    } else {
      setFilteredJournal(journal);
    }
  };

  const navigateToPlantDetail = (journal_id) => {
    router.push(`/plant-entry/details/${journal_id}`);
  };

  const navigateToAddEntry = () => {
    router.push('/plant-entry/add');
  };

  const renderJournalEntry = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigateToPlantDetail(item.journal_id)}
    >
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeDetails}>
          {item.species ? `${item.species} • ` : ''}
          {item.fertilizer ? `${item.fertilizer} • ` : ''}
          {item.watering_time ? `${item.watering_time} mins` : 'No time specified'}
          {item.remind
            ? `\u2611 Remind Me` // checked box
            : `\u2610 Remind Me` // unchecked box
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants..."
          value={searchTerm}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          {filteredJournal.length > 0 ? (
            <FlatList
              data={filteredJournal}
              renderItem={renderJournalEntry}
              keyExtractor={(item) => item.journal_id.toString()}
              contentContainerStyle={styles.recipeList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchTerm
                  ? "No plants match your search"
                  : "No plant entries yet. Add your first one!"}
              </Text>
            </View>
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={navigateToAddEntry}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  recipeList: {
    padding: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeDetails: {
    color: '#757575',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 32,
    color: 'white',
    marginTop: -4,
  },
});