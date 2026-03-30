import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
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
  border: '#E2E8F0'
};

const categories = [
  { id: 'hospitality', name: 'Hospitality', icon: 'coffee' },
  { id: 'guides', name: 'Local Guides', icon: 'map-pin' },
  { id: 'storytellers', name: 'Storytellers', icon: 'book-open' },
  { id: 'accountability', name: 'Accountability', icon: 'target' },
];

export default function HomeScreen({ navigation }) {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadHosts();
  }, [selectedCategory]);

  const loadHosts = async () => {
    try {
      const params = {};
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const response = await hostService.getHosts(params);
      setHosts(response.data.hosts);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load hosts'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHosts();
  };

  const filteredHosts = hosts.filter(host =>
    host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    host.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHost = ({ item }) => (
    <TouchableOpacity
      style={styles.hostCard}
      onPress={() => navigation.navigate('HostDetails', { hostId: item.id })}
    >
      <Image
        source={{ uri: item.profile_photo || 'https://via.placeholder.com/80' }}
        style={styles.hostPhoto}
      />
      <View style={styles.hostInfo}>
        <Text style={styles.hostName}>{item.name}</Text>
        <Text style={styles.hostBio} numberOfLines={2}>
          {item.bio}
        </Text>
        <View style={styles.hostMeta}>
          <View style={styles.rating}>
            <Icon name="star" size={14} color={colors.accent} />
            <Text style={styles.ratingText}>
              {item.avg_rating > 0 ? item.avg_rating.toFixed(1) : 'New'}
            </Text>
          </View>
          <Text style={styles.price}>${item.hourly_rate}/hour</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.categoryCardSelected
      ]}
      onPress={() => setSelectedCategory(
        selectedCategory === item.id ? null : item.id
      )}
    >
      <Icon
        name={item.icon}
        size={24}
        color={selectedCategory === item.id ? colors.primary : colors.textLight}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find a Host</Text>
        <Text style={styles.headerSubtitle}>Connection, not dating</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hosts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Hosts List */}
      <FlatList
        data={filteredHosts}
        renderItem={renderHost}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.hostsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="users" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No hosts found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or category filter
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    minWidth: 80,
  },
  categoryCardSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: 'white',
  },
  hostsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  hostCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hostPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  hostName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hostBio: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  hostMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
});
