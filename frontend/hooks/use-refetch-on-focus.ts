import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useRefetchOnFocus(refetch: () => void) {
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
}
