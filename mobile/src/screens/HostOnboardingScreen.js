import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { hostService } from '../services/api';
import Toast from 'react-native-toast-message';

const colors = {
  primary: '#2F6FE4',
  secondary: '#FDF7F2',
  accent: '#22C55E',
  text: '#0F172A',
  textLight: '#64748B',
  background: '#FFFFFF',
  border: '#E2E8F0',
  error: '#EF4444'
};

const categories = [
  { id: 'conversation', name: 'Conversation', icon: 'message-circle' },
  { id: 'mentorship', name: 'Mentorship', icon: 'users' },
  { id: 'local_guide', name: 'Local Guide', icon: 'map-pin' },
  { id: 'wellness', name: 'Wellness', icon: 'heart' },
  { id: 'creative', name: 'Creative', icon: 'camera' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
  { id: 'food_drink', name: 'Food & Drink', icon: 'coffee' },
  { id: 'fitness', name: 'Fitness', icon: 'activity' }
];

export default function HostOnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    specialties: '',
    offerings: '',
    hourlyRate: '',
    categories: [],
    availability: 'flexible'
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          Toast.show({
            type: 'error',
            text1: 'Required Field',
            text2: 'Please enter your professional title'
          });
          return false;
        }
        if (!formData.bio.trim() || formData.bio.length < 50) {
          Toast.show({
            type: 'error',
            text1: 'Bio Required',
            text2: 'Please write at least 50 characters about yourself'
          });
          return false;
        }
        return true;
      case 2:
        if (formData.categories.length === 0) {
          Toast.show({
            type: 'error',
            text1: 'Categories Required',
            text2: 'Please select at least one category'
          });
          return false;
        }
        return true;
      case 3:
        if (!formData.specialties.trim()) {
          Toast.show({
            type: 'error',
            text1: 'Specialties Required',
            text2: 'Please describe your specialties'
          });
          return false;
        }
        if (!formData.offerings.trim()) {
          Toast.show({
            type: 'error',
            text1: 'Offerings Required',
            text2: 'Please describe what you offer'
          });
          return false;
        }
        return true;
      case 4:
        if (!formData.hourlyRate || parseFloat(formData.hourlyRate) < 10) {
          Toast.show({
            type: 'error',
            text1: 'Rate Required',
            text2: 'Please set a rate of at least $10/hour'
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await hostService.createProfile(formData);
      Toast.show({
        type: 'success',
        text1: 'Application Submitted',
        text2: 'We\'ll review your application and get back to you soon!'
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'Please try again or contact support'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    const updatedCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId];
    
    setFormData({ ...formData, categories: updatedCategories });
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>
        Help guests understand who you are and what makes you special.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Professional Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Marketing Professional & Coffee Enthusiast"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bio * (minimum 50 characters)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Share your story, interests, and what you're passionate about..."
          value={formData.bio}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>{formData.bio.length}/50</Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose your categories</Text>
      <Text style={styles.stepSubtitle}>
        Select the areas where you can provide value to guests.
      </Text>

      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              formData.categories.includes(category.id) && styles.categoryCardSelected
            ]}
            onPress={() => toggleCategory(category.id)}
          >
            <Icon
              name={category.icon}
              size={24}
              color={formData.categories.includes(category.id) ? colors.primary : colors.textLight}
            />
            <Text
              style={[
                styles.categoryText,
                formData.categories.includes(category.id) && styles.categoryTextSelected
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your expertise</Text>
      <Text style={styles.stepSubtitle}>
        Describe your specialties and what you can offer to guests.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Specialties *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="What are you particularly good at or known for?"
          value={formData.specialties}
          onChangeText={(text) => setFormData({ ...formData, specialties: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What you offer *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe the experience or value you provide to guests..."
          value={formData.offerings}
          onChangeText={(text) => setFormData({ ...formData, offerings: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Set your rate</Text>
      <Text style={styles.stepSubtitle}>
        Choose your hourly rate. You can always adjust this later.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Hourly Rate (USD) *</Text>
        <View style={styles.rateInputContainer}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.rateInput}
            placeholder="25"
            value={formData.hourlyRate}
            onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
            keyboardType="numeric"
          />
          <Text style={styles.perHour}>/hour</Text>
        </View>
      </View>

      <View style={styles.rateInfo}>
        <Icon name="info" size={16} color={colors.primary} />
        <Text style={styles.rateInfoText}>
          OnPurpose takes a 20% platform fee. You'll receive 80% of your rate.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Host</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentStep / totalSteps) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Submit Application' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: colors.primary,
  },
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  rateInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.text,
  },
  perHour: {
    fontSize: 16,
    color: colors.textLight,
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  rateInfoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});
