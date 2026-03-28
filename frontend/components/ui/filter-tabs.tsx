import { useState } from 'react';
import { ScrollView, Pressable, View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography';
import { Colors, Spacing } from '@/constants';

interface FilterTabsProps {
  tabs: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  const [selected, setSelected] = useState(activeTab ?? tabs[0]);

  const handlePress = (tab: string) => {
    setSelected(tab);
    onTabChange?.(tab);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = selected === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => handlePress(tab)}
            style={styles.tab}
            testID={`filterTab.${tab}`}
          >
            <AppText
              variant="labelLarge"
              color={isActive ? Colors.onSurface : Colors.outline}
            >
              {tab}
            </AppText>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  indicator: {
    marginTop: Spacing.xs,
    height: 2,
    width: '100%',
    backgroundColor: Colors.primary,
  },
});
