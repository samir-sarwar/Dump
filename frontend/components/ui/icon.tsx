import Feather from '@expo/vector-icons/Feather';
import { Colors } from '@/constants';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface IconProps {
  name: FeatherIconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = Colors.onSurface }: IconProps) {
  return <Feather name={name} size={size} color={color} />;
}
