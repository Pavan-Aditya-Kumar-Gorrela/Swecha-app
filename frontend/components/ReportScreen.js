import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Input, CheckBox } from 'react-native-elements';
import * as MailComposer from 'expo-mail-composer';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';

export default function ReportScreen() {
  const [yourName, setYourName] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [address, setAddress] = useState('');
  const [typeOfIncident, setTypeOfIncident] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [victimName, setVictimName] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [witnessPhones, setWitnessPhones] = useState(['']);
  const [reportedToAuthorities, setReportedToAuthorities] = useState(false);
  const [informedTrustedContacts, setInformedTrustedContacts] = useState(false);
  const [other, setOther] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fileUpload, setFileUpload] = useState('');

  const addWitnessPhone = () => {
    setWitnessPhones([...witnessPhones, '']);
  };

  const updateWitnessPhone = (index, value) => {
    const newWitnessPhones = [...witnessPhones];
    newWitnessPhones[index] = value;
    setWitnessPhones(newWitnessPhones);
  };

  const removeWitnessPhone = (index) => {
    const newWitnessPhones = witnessPhones.filter((_, i) => i !== index);
    setWitnessPhones(newWitnessPhones.length ? newWitnessPhones : ['']);
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      Alert.alert('Error', 'Please accept the Terms & Conditions.');
      return;
    }

    const emailBody = `
Your Name: ${yourName}
Incident Date: ${incidentDate}
Incident Time: ${incidentTime}
Address: ${address}
Type of Incident: ${typeOfIncident}
Incident Description: ${incidentDescription}
Witnesses Phone Numbers: ${witnessPhones.filter(phone => phone).join(', ')}
Reported to Authorities: ${reportedToAuthorities ? 'Yes' : 'No'}
Informed Trusted Contacts: ${informedTrustedContacts ? 'Yes' : 'No'}
Other: ${other}
Attached File: ${fileUpload}
    `.trim();

    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      const options = {
        recipients: ['pavanadityakumarg2004@gmail.com'], // Replace with actual email
        subject: 'Incident Report Submission',
        body: emailBody,
      };
      await MailComposer.composeAsync(options);
    } else {
      Alert.alert('Error', 'Email is not available on this device.');
    }
  };

  return (
    <LinearGradient colors={['#2C003E', '#FF007A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Report</Text>

        <Input
          placeholder="Your Name"
          value={yourName}
          onChangeText={setYourName}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
        />
        <Input
          placeholder="Incident Date (e.g., MM/DD/YYYY)"
          value={incidentDate}
          onChangeText={setIncidentDate}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
          keyboardType="numeric" // Suggests date entry, enhance with date picker
        />
        <Input
          placeholder="Incident Time (e.g., HH:MM AM/PM)"
          value={incidentTime}
          onChangeText={setIncidentTime}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
          keyboardType="numeric" // Suggests time entry, enhance with time picker
        />
        <Input
          placeholder="Enter Location of Incident"
          value={address}
          onChangeText={setAddress}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
          multiline
          numberOfLines={2}
        />
        <Input
          placeholder="Type of Incident (e.g., Harassment, Theft)"
          value={typeOfIncident}
          onChangeText={setTypeOfIncident}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
          // Simulated text input; enhance with Picker for options
        />
        <Input
          placeholder="Incident Description"
          value={incidentDescription}
          onChangeText={setIncidentDescription}
          multiline
          numberOfLines={4}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
        />
        {witnessPhones.map((phone, index) => (
          <View key={index} style={styles.witnessContainer}>
            <Input
              placeholder={`Enter Witnesses Phone Number ${index + 1}`}
              value={phone}
              onChangeText={(value) => updateWitnessPhone(index, value)}
              inputStyle={styles.inputText}
              inputContainerStyle={styles.inputContainer}
              keyboardType="phone-pad"
            />
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeWitnessPhone(index)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addWitnessPhone}>
          <Text style={styles.addText}>Add Another Witness</Text>
        </TouchableOpacity>

        <CheckBox
          title="Reported to Authorities"
          checked={reportedToAuthorities}
          onPress={() => setReportedToAuthorities(!reportedToAuthorities)}
          containerStyle={styles.checkBox}
          textStyle={styles.checkBoxText}
        />
        <CheckBox
          title="Informed Trusted Contacts"
          checked={informedTrustedContacts}
          onPress={() => setInformedTrustedContacts(!informedTrustedContacts)}
          containerStyle={styles.checkBox}
          textStyle={styles.checkBoxText}
        />
        <CheckBox
          title="Other"
          checked={other !== ''}
          onPress={() => setOther(other ? '' : 'Other')}
          containerStyle={styles.checkBox}
          textStyle={styles.checkBoxText}
          checkedIcon="square"
          uncheckedIcon="square-o"
        />
        {other && (
          <Input
            placeholder="Enter other details"
            value={other}
            onChangeText={setOther}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputContainer}
          />
        )}

        <Input
          placeholder="Upload Evidence (Optional)"
          value={fileUpload}
          onChangeText={setFileUpload}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
          rightIcon={<Entypo name="attachment" size={20} color="#FFF" />}
        />
        <Text style={styles.fileNote}>
          Attach file. File size of your documents should not exceed 10MB
        </Text>
        <CheckBox
          title="I agree to the Terms & Conditions and Privacy Policy"
          checked={termsAccepted}
          onPress={() => setTermsAccepted(!termsAccepted)}
          containerStyle={styles.checkBox}
          textStyle={styles.checkBoxText}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient colors={['#FF007A', '#FF3399']} style={styles.submitGradient}>
            <Text style={styles.submitText}>Submit Report</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="location-pin" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="report-problem" size={24} color="#FF007A" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="users" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C003E',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF007A',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 15,
  },
  inputText: {
    color: '#FFF',
    fontSize: 16,
  },
  witnessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
  removeText: {
    color: '#FF007A',
    fontSize: 14,
  },
  addButton: {
    marginBottom: 15,
  },
  addText: {
    color: '#FF007A',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  checkBox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 10,
  },
  checkBoxText: {
    color: '#FFF',
    fontSize: 14,
  },
  fileNote: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
  },
  submitGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2A002A',
    borderRadius: 30,
    paddingVertical: 10,
    elevation: 5,
  },
});