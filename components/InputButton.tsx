import Ionicons from '@expo/vector-icons/Ionicons';
import { 
    StyleSheet, 
    View, 
    Pressable, 
    Text,
} from 'react-native';

type Props = {
    label: string
    value: string
    handlePress: () => void
};

export default function InputButton({ 
    label,
    value,
    handlePress
}: Props) {
  return (
    <>
        <Text style={styles.label}>{label}</Text>
        <Pressable 
            style={styles.button}
            onPress={handlePress}
        >
            <Text style={styles.text}>{value}</Text>
            <Ionicons name="chevron-down-outline" size={18} />
        </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'lightgrey',
        marginBottom: 20
    },
    label: {
        marginBottom: 10,
        fontWeight: 'bold'
    },
    text: {
        fontSize: 18
    },
});