import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

function EmergencyContacts({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState([]);

  // Load contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const storedContacts = await AsyncStorage.getItem("emergencyContacts");
        if (storedContacts) {
          setContacts(JSON.parse(storedContacts));
        }
      } catch (error) {
        console.error("Error loading contacts:", error);
      }
    };
    loadContacts();
  }, []);

  // Save new contact
  const handleAddContact = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Please enter both name and phone number.");
      return;
    }

    const newContact = { id: Date.now().toString(), name, phone };
    const updatedContacts = [...contacts, newContact];

    try {
      await AsyncStorage.setItem("emergencyContacts", JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      setName("");
      setPhone("");
      Alert.alert("Success", "Contact added!");
    } catch (error) {
      console.error("Error saving contact:", error);
      Alert.alert("Error", "Failed to save contact.");
    }
  };

  // Delete contact
  const handleDeleteContact = async (id) => {
    const updatedContacts = contacts.filter((contact) => contact.id !== id);
    try {
      await AsyncStorage.setItem("emergencyContacts", JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      Alert.alert("Success", "Contact deleted!");
    } catch (error) {
      console.error("Error deleting contact:", error);
      Alert.alert("Error", "Failed to delete contact.");
    }
  };

  // Render contact item
  const renderContact = ({ item }) => (
    <View style={styles.contactItem}>
      <View>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteContact(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#ff3399" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={["#0f001a", "#3d003f"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Emergency Contacts</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Contact Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <LinearGradient colors={["#ff3399", "#cc0066"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Add Contact</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.contactList}
        ListEmptyComponent={<Text style={styles.emptyText}>No contacts added.</Text>}
      />
    </LinearGradient>
  );
}

export default EmergencyContacts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  formContainer: {
    marginTop: 20,
  },
  input: {
    backgroundColor: "#2a002a",
    color: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  contactList: {
    marginTop: 20,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a002a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  contactPhone: {
    color: "#aaa",
    fontSize: 14,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});