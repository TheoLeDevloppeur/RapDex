// Stockage en mémoire pour les tests (fourni par AsyncStorage).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
