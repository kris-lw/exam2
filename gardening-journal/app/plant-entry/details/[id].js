// app/recipe/[id].js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlantById, deleteEntry } from '../../database/db';

export default function PlantDetailScreen() {
const { id } = useLocalSearchParams();
const router = useRouter();
const [entry, setEntry] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
    loadEntry();
}, [id]);

const loadEntry = async () => {
    try {
        setLoading(true);
        const entryData = await getPlantById(parseInt(id));
        if (entryData) {
            setRecipe(entryData);
        }
        else {
            Alert.alert('Error', 'Plant entry not found');
            router.back();
        }
    }
    catch (error) {
        console.error('Error loading plant entry:', error);
        Alert.alert('Error', 'Failed to load plant details');
    }
    finally {
        setLoading(false);
    }
};

const handleEditEntry = () => {
    router.push(`/plant-entry/edit/${id}`);
};

const handleDeleteEntry = () => {
    Alert.alert(
        'Delete Plant Entry',
        'Are you sure you want to delete this plant entry?',
        [
            { text: 'Cancel', style: 'cancel' },
            {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
                try {
                    await deleteEntry(parseInt(id));
                    router.replace('/');
                }
                catch (error) {
                    console.error('Error deleting plant entry:', error);
                    Alert.alert('Error', 'Failed to delete plant entry');
                }
            },
            },
        ],
        { cancelable: true }
    );
};

if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="green" />
        </View>
    );
}

if (!entry) {
    return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Plant entry not found</Text>
        </View>
    );
}

// FIXME: change all styling to match container contents
return (
    <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {entry.image_uri ? (
                <Image source={{ uri: entry.image_uri }} style={styles.recipeImage} />
            ) : (
                <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>No Image Provided</Text>
                </View>
            )}

            <View style={styles.recipeHeader}>
                <Text style={styles.recipeName}>{entry.name}</Text>
                <View style={styles.recipeMetaContainer}>
                    {entry.species ? (
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Species:</Text>
                        <Text style={styles.metaValue}>{entry.species}</Text>
                    </View>
                    ) : null}
                    
                    {entry.watering_time ? (
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Watering Time:</Text>
                        <Text style={styles.metaValue}>{entry.watering_time} mins</Text>
                    </View>
                    ) : null}
                </View>
            </View>

            {entry.description ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description:</Text>
                    <Text style={styles.descriptionText}>{entry.description}</Text>
                </View>
            ) : null}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Watering Log</Text>
                {entry.waterLog.length > 0
                    ?  (entry.waterLog
                        .sort((a, b) => a.watering_id - b.watering_id) // sort by watering_id
                        .map((watering, index) => (
                            <View key={index} style={styles.ingredientItem}>
                                <Text style={styles.ingredientText}>
                                {watering.date && watering.time
                                    ? (`Plant Watered: ${watering.date} - ${watering.time}`
                                        (watering.fertilizer 
                                            ? ` - Fertilized? Y`
                                            : ` - Fertilized? N`))
                                    : 'No watering information available'}
                                
                                </Text>
                            </View>
                        )))
                    :  (<Text style={styles.emptyListText}>No watering log added</Text>)
                }
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weather Log</Text>
                {entry.weatherLog.length > 0
                    ?  (entry.weatherLog
                        .sort((a, b) => a.weather_id - b.weather_id) // sort by weather_id
                        .map((weather, index) => (
                            <View key={index} style={styles.stepItem}>
                                <Text style={styles.stepText}>
                                    {weather.date && weather.time
                                        ? `Weather Recorded: ${weather.date} - ${weather.time}`
                                        : 'No weather information available'}
                                    {weather.inclement_weather 
                                        ? `**Inclement Weather**`
                                            (weather.conditions
                                                ? `\nDescription: ${weather.conditions}`
                                                : null)
                                        : `No inclement weather reported`}
                                </Text>
                            </View>)))
                    :  (<Text style={styles.emptyListText}>No weather log added</Text>)
                }
            </View>
        </ScrollView>

        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEditEntry}
            >
                <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteEntry}
            >
                <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#757575',
    },
    scrollContent: {
        paddingBottom: 80,
    },
    recipeImage: {
        width: '100%',
        height: 250,
    },
    noImageContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#757575',
        fontSize: 18,
    },
    recipeHeader: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    recipeName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    recipeMetaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        marginRight: 16,
        marginBottom: 4,
    },
    metaLabel: {
        fontWeight: 'bold',
        marginRight: 4,
        color: '#757575',
    },
    metaValue: {
        color: '#757575',
    },
    section: {
        padding: 16,
        backgroundColor: 'white',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    ingredientItem: {
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    ingredientText: {
        fontSize: 16,
        color: '#333',
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff6b6b',
        color: 'white',
        textAlign: 'center',
        lineHeight: 24,
        marginRight: 12,
        fontSize: 14,
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    emptyListText: {
        fontSize: 16,
        color: '#757575',
        fontStyle: 'italic',
    },
    actionButtonsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        padding: 8,
    },
    actionButton: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        margin: 8,
    },
    editButton: {
        backgroundColor: '#4dabf7',
    },
    deleteButton: {
        backgroundColor: '#ff6b6b',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});