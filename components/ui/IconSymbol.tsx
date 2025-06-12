import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

type Props = {
  name: string;
  size?: number;
  color?: string;
  pack?: 'ion' | 'ant' | 'fa' | 'material' | 'feather'; // icon pack identifier
};

export const IconSymbol = ({
  name,
  size = 24,
  color = 'black',
  pack = 'ion',
}: Props) => {
  switch (pack) {
    case 'ant':
      return <AntDesign name={name as any} size={size} color={color} />;
    case 'fa':
      return <FontAwesome name={name as any} size={size} color={color} />;
    case 'material':
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case 'feather':
      return <Feather name={name as any} size={size} color={color} />;
    case 'ion':
    default:
      return <Ionicons name={name as any} size={size} color={color} />;
  }
};
