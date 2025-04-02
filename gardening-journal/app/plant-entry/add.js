// app/plant-entry/add.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput,
        TouchableOpacity, Alert, KeyboardAvoidingView,
        Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { saveEntry } from '../database/db';

export default function AddPlantEntryScreen() {
    const [entry, setEntry] = useState({
        name: '',
        description: '' || null,
        species: '' || null,
        fertilizer: '',
        watering_time: 0,
        date_planted: '',
        remind: false,
        image_uri: '' || null,
    });
    const [waterLog, setWaterLog] = useState([{
        water_amount: 0,
        time: '',
        date: '',
        fertilizer: false
    }]);
    const [weatherLog, setWeatherLog] = useState([{
        time: '',
        date: '',
        climate: '',
        inclement_weather: false,
        conditions: '' || null
    }]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleEntryChange = (key, value) => {
        setEntry(prev => {
            if (prev[key] === value) return prev; // Avoid unnecessary updates
            return { ...prev, [key]: value };
        });
    };

    const handleWateringChange = (index, key, value) => {
        if (index >= 0 && index < waterLog.length) {
            const updatedWatering = [...waterLog];
            updatedWatering[index][key] = value;
            setWaterLog(updatedWatering);
        }
    };
    
    const handleWeatherChange = (index, key, value) => {
        if (index >= 0 && index < weatherLog.length) {
            const updatedWeather = [...weatherLog];
            updatedWeather[index][key] = value;
            setWeatherLog(updatedWeather);
        }
    };

    const addWatering = () => {
        setWaterLog([...waterLog, {
            water_amount: 0,
            time: '',
            date: '',
            fertilizer: false
        }]);
    };
    
    const removeWatering = (index) => {
        if (waterLog.length > 1) {
            const updatedWaterLog = [...waterLog];
            updatedWaterLog.splice(index, 1);
            setWaterLog(updatedWaterLog);
        }
    };
    
    const addWeather = () => {
        setWeatherLog([...weatherLog, {
            time: '',
            date: '',
            climate: '',
            inclement_weather: false,
            conditions: ''
        }]);
    };
    
    const removeWeather = (index) => {
        if (weatherLog.length > 1) {
            const updatedWeatherLog = [...weatherLog];
            updatedWeatherLog.splice(index, 1);
            setWeatherLog(updatedWeatherLog);
        }
    };

    const handleSaveEntry = async () => {
        // Validate form
        if (!entry.name.trim()) {
            Alert.alert('Error', 'Plant name is required');
            return;
        }

        if (!entry.fertilizer.trim()) {
            Alert.alert('Error', 'Fertilizer is required');
            return;
        }

        if (!entry.watering_time.trim()) {
            Alert.alert('Error', 'Watering time is required');
            return;
        }

        if (!entry.date_planted.trim()) {
            Alert.alert('Error', 'Planting date is required');
            return;
        }

        // Validate ingredients
        const validWaterLog = waterLog.filter(watering => watering.water_amount.trim());
        if (validWaterLog.length === 0) {
            Alert.alert('Error', 'Add at least one watering log entry');
            return;
        }
        else if (!watering.time.trim()) {
            Alert.alert('Error', 'Time watered is required');
            return;
        }
        else if (!watering.date.trim()) {
            Alert.alert('Error', 'Date watered is required');
            return;
        }

        // Validate steps
        const validWeatherLog = weatherLog.filter(weather => weather.climate.trim());
        if (validWeatherLog.length === 0) {
            Alert.alert('Error', 'Add at least one weather log entry');
            return;
        }
        else if (!weather.time.trim()) {
            Alert.alert('Error', 'Time for weather entry is required');
            return;
        }
        else if (!watering.date.trim()) {
            Alert.alert('Error', 'Date for weather entry is required');
            return;
        }

        try {
            setLoading(true);
            
            // Convert watering time to number if provided
            const entryToSave = {
                ...entry,
                watering_time: entry.watering_time ? parseInt(entry.watering_time, 10) : 0
            };
            
            await saveEntry(entryToSave, validWaterLog, validWeatherLog);
            Alert.alert('Success', 'Plant entry saved successfully', [
                { text: 'OK', onPress: () => router.replace('/') }
            ]);
        }
        catch (error) {
            console.error('Error saving plant entry:', error);
            Alert.alert('Error', 'Failed to save plant entry');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Plant Information</Text>
                    
                    <View style={styles.formField}>
                        <Text style={styles.label}>Plant Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={entry.name}
                            onChangeText={(value) => handleEntryChange('name', value)}
                            placeholder="Enter plant name (e.g., Fern, Succulent, Cactus, Joey)"
                        />
                    </View>
                    
                    <View style={styles.formField}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={entry.description}
                            onChangeText={(value) => handleEntryChange('description', value)}
                            placeholder="Enter plant description (optional)"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                    
                    <View style={styles.formField}>
                        <Text style={styles.label}>Species</Text>
                            <TextInput
                                style={styles.input}
                                value={entry.species}
                                onChangeText={(value) => handleEntryChange('species', value)}
                                placeholder="Enter plant species (e.g., Rose, Pothos, Aloe, Snake) (optional)"
                            />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.label}>Fertilizer *</Text>
                            <TextInput
                                style={styles.input}
                                value={entry.fertilizer}
                                onChangeText={(value) => handleEntryChange('fertilizer', value)}
                                placeholder="Enter fertilizer used (e.g., Miracle-Gro, Osmocote)"
                            />
                    </View>
                    
                    <View style={styles.formField}>
                        <Text style={styles.label}>Watering Time (minutes) *</Text>
                            <TextInput
                                style={styles.input}
                                value={parseInt(entry.watering_time, 10)}
                                onChangeText={(value) => handleEntryChange('watering_time', value)}
                                placeholder="Enter time it takes to water plant in minutes"
                                keyboardType="numeric"
                            />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.label}>Date Planted *</Text>
                            <TextInput
                                style={styles.input}
                                value={entry.date_planted}
                                onChangeText={(value) => handleEntryChange('date_planted', value)}
                                placeholder="Enter date plant was planted (e.g., MM/DD/YYYY)"
                            />
                    </View>
                    
                    <View style={styles.formField}>
                        <Text style={styles.label}>Receive reminders for watering? (defaults to 'no')</Text>
                        <TouchableOpacity
                            style={styles.remindButton}
                            onPress={() => handleEntryChange('remind', !entry.remind)}
                        >
                            {entry.remind
                                ? <Text>{'\u2611'} Remind Me</Text> // checked box
                                : <Text>{'\u2610'} Remind Me</Text> // unchecked box
                            }
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.label}>Image of Plant</Text>
                        <TextInput
                            style={styles.input}
                            value={entry.image_uri}
                            onChangeText={(value) => handleEntryChange('image_uri', value)}
                            placeholder="Enter image URL (optional)"
                        />
                    </View>
                </View>
                
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Watering Log</Text>
                        {waterLog.map((watering, index) => (
                            <View key={index} style={styles.ingredientContainer}>
                                <View style={styles.formFieldRow}>
                                    <View style={styles.ingredientQuantity}>
                                        <Text style={styles.label}>Date *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={watering.date}
                                            onChangeText={(value) => handleWateringChange(index, 'date', value)}
                                            placeholder="Enter date watered (e.g., MM/DD/YYYY)"
                                        />
                                    </View>
    
                                    <View style={styles.ingredientQuantity}>
                                        <Text style={styles.label}>Time *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={watering.time}
                                            onChangeText={(value) => handleWateringChange(index, 'time', value)}
                                            placeholder="Enter time watered (e.g., HR:SC AM/PM)"
                                        />
                                    </View>
                                </View>
                                <View style={styles.formFieldRow}>
                                    <View style={styles.ingredientName}>
                                        <Text style={styles.label}>Water Amount (inches) *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={watering.water_amount}
                                            onChangeText={(value) => handleWateringChange(index, 'water_amount', value)}
                                            placeholder="Enter amount of water fed to plant (e.g., 2)"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    
                                <View style={styles.formFieldRow}>
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>Used fertilizer? (defaults to 'no') *</Text>
                                        <TouchableOpacity style={styles.remindButton} onPress={() => handleWateringChange(index, 'fertilizer', !watering.fertilizer)}>
                                            {watering.fertilizer
                                                ? <Text>{'\u2611'} Fertilizer</Text> // checked box
                                                : <Text>{'\u2610'} Fertilizer</Text> // unchecked box
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                    
                                </View>
                            {waterLog.length > 1 && (
                                <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeWatering(index)}
                                >
                                <Text style={styles.removeButtonText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={addWatering}
                    >
                        <Text style={styles.addButtonText}>+ Add Watering Entry</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Weather Log</Text>
                        {weatherLog.map((weather, index) => (
                            <View key={index} style={styles.stepContainer}>
                                <View style={styles.stepInstructionContainer}>
                                    <View style={styles.ingredientQuantity}>
                                        <Text style={styles.label}>Date *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={weather.date}
                                            onChangeText={(value) => handleWeatherChange(index, 'date', value)}
                                            placeholder="Enter date recorded (e.g., MM/DD/YYYY)"
                                        />
                                    </View>
    
                                    <View style={styles.ingredientQuantity}>
                                        <Text style={styles.label}>Time *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={weather.time}
                                            onChangeText={(value) => handleWeatherChange(index, 'time', value)}
                                            placeholder="Enter time recorded (e.g., HR:SC AM/PM)"
                                        />
                                    </View>
    
                                    <View style={styles.ingredientQuantity}>
                                        <Text style={styles.label}>Climate *</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={weather.climate}
                                            onChangeText={(value) => handleWeatherChange(index, 'climate', value)}
                                            placeholder="Enter climate (e.g., sunny, rainy, overcast)"
                                        />
                                    </View>
    
                                    <View style={styles.formField}>
                                        <Text style={styles.label}>Inclement weather? (defaults to 'no') *</Text>
                                        <TouchableOpacity style={styles.remindButton} onPress={() => handleWeatherChange(index, 'inclement_weather', !weather.inclement_weather)}>
                                            {weather.inclement_weather
                                                ? <Text>{'\u2611'} Inclement Weather</Text> // checked box
                                                : <Text>{'\u2610'} Inclement Weather</Text> // unchecked box
                                            }
                                        </TouchableOpacity>
                                    </View>

                                    {weather.inclement_weather
                                        ? (
                                        <View style={styles.ingredientName}>
                                            <Text style={styles.label}>Conditions</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={weather.conditions}
                                                onChangeText={(value) => handleWeatherChange(index, 'conditions', value)}
                                                placeholder="Enter inclement conditions (e.g., storm, hail) (optional)"
                                            />
                                        </View>
                                    )
                                    : weather.conditions = '' /* Reset conditions if inclement weather is not selected */}
                                    {weatherLog.length > 1 && (
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeWeather(index)}
                                    >
                                        <Text style={styles.removeButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                        
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={addWeather}
                        >
                            <Text style={styles.addButtonText}>+ Add Weather Entry</Text>
                        </TouchableOpacity>
                </View>
                
                <View style={styles.submitButtonContainer}>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSaveEntry}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                        {loading ? 'Saving...' : 'Save Plant Entry'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    scrollView: {
        flex: 1,
    },
    formSection: {
        backgroundColor: 'white',
        margin: 16,
        marginBottom: 8,
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    formField: {
        marginBottom: 16,
    },
    formFieldRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        minHeight: 80,
    },
    ingredientContainer: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    ingredientName: {
        flex: 3,
        marginRight: 8,
    },
    ingredientQuantity: {
        flex: 1,
        marginRight: 8,
    },
    ingredientUnit: {
        flex: 1,
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    stepNumberContainer: {
        marginRight: 16,
        marginTop: 30,
    },
    stepNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ff6b6b',
        color: 'white',
        textAlign: 'center',
        lineHeight: 30,
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepInstructionContainer: {
        flex: 1,
    },
    addButton: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 8,
    },
    addButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    removeButton: {
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    removeButtonText: {
        color: '#ff6b6b',
        fontWeight: 'bold',
    },
    submitButtonContainer: {
        margin: 16,
    },
    submitButton: {
        backgroundColor: '#4dabf7',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});