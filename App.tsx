import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './src/firebase/config';
import { addList, ListItem, listenToLists } from './src/firebase/lists';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  if (authLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.helperText}>Checking session...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {user ? <ListsScreen user={user} /> : <SignInScreen />}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  helperText: {
    marginTop: 12,
    color: '#64748b',
  },
  listContainer: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  listItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  listTimestamp: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  signOutButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 12,
  },
  signOutText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [request, response, promptAsync] = useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token: idToken } = response.params;
      if (!idToken) {
        Alert.alert('Google Sign-in', 'Missing ID token from Google response.');
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential).catch((error) => {
        Alert.alert('Google Sign-in failed', error.message);
      });
    }
  }, [response]);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter an email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Sign-in failed', error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter an email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Sign-up failed', error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Welcome to SupplyRun</Text>
      <Text style={styles.subtitle}>Sign in to create and manage your lists.</Text>

      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleEmailSignIn}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleCreateAccount}
        disabled={submitting}
      >
        <Text style={styles.secondaryButtonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={styles.secondaryButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

function ListsScreen({ user }: { user: User }) {
  const [lists, setLists] = useState<ListItem[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToLists(user.uid, (nextLists) => {
      setLists(nextLists);
      setLoading(false);
    });
    return unsubscribe;
  }, [user.uid]);

  const formattedLists = useMemo(
    () =>
      lists.map((list) => ({
        ...list,
        displayDate: list.createdAt
          ? new Date(list.createdAt).toLocaleString()
          : 'Pending sync',
      })),
    [lists],
  );

  const handleCreateList = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a title for your list.');
      return;
    }

    try {
      await addList(user.uid, title.trim());
      setTitle('');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Unable to save list', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut(auth)}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Your Lists</Text>
        <Text style={styles.subtitle}>Create a new list and sync it to Firestore.</Text>

        <Text style={styles.inputLabel}>List Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Weekly restock"
          value={title}
          onChangeText={setTitle}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateList}>
          <Text style={styles.buttonText}>Create List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <FlatList
            data={formattedLists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listTimestamp}>{item.displayDate}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.listHeader}>
                <Text style={styles.subtitle}>No lists yet. Add your first list above.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
