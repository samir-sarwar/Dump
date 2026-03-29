import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';
import { useDebounce } from '@/hooks/use-debounce';
import { searchUsers } from '@/lib/api';
import type { UserProfileDto } from '@/lib/types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfileDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query.trim(), 300);

  useEffect(() => {
    if (debouncedQuery.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setIsLoading(true);
      try {
        const data = await searchUsers(debouncedQuery);
        if (!cancelled) {
          setResults(data.users);
          setHasSearched(true);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setHasSearched(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const renderItem = ({ item }: { item: UserProfileDto }) => (
    <Pressable
      style={styles.row}
      onPress={() => router.push(`/(tabs)/(feed)/user/${item.id}`)}
    >
      <Avatar source={item.avatarUrl} size={44} />
      <View style={styles.rowText}>
        <AppText variant="titleSmall">{item.name}</AppText>
        <AppText variant="bodySmall" color={Colors.onSurfaceVariant}>
          @{item.username}
        </AppText>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable testID="search.btn.back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="arrow-left" size={22} color={Colors.onSurface} />
        </Pressable>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={18} color={Colors.outline} />
          <TextInput
            testID="search.input.query"
            style={styles.searchInput}
            placeholder="Search by username"
            placeholderTextColor={Colors.outline}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable testID="search.btn.clearQuery" onPress={() => setQuery('')} hitSlop={8}>
              <Icon name="x" size={16} color={Colors.onSurfaceVariant} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}

      {!isLoading && !hasSearched && query.length === 0 && (
        <View style={styles.centered}>
          <Icon name="search" size={40} color={Colors.outlineVariant} />
          <AppText
            variant="bodyMedium"
            color={Colors.onSurfaceVariant}
            style={styles.hint}
          >
            Search for people by username
          </AppText>
        </View>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <View style={styles.centered}>
          <Icon name="user-x" size={40} color={Colors.outlineVariant} />
          <AppText
            variant="bodyMedium"
            color={Colors.onSurfaceVariant}
            style={styles.hint}
          >
            No users found for "{debouncedQuery}"
          </AppText>
        </View>
      )}

      {!isLoading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.onSurface,
    paddingVertical: Spacing.xs,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: Spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  hint: {
    marginTop: Spacing.xs,
  },
  list: {
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
