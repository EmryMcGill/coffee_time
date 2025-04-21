import { useEffect, useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text,
    Image,
    Pressable,
} from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { usePocket } from '@/context/pocketbase';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function CoffeeCard({ 
    title,
    inWeight,
    outWeight,
    time,
    grindSize,
    image,
    beans,
    notes,
    created,
    name,
    id,
    postUser,
    avatar,
    handleDelete
}) {

    const { user } = usePocket();

    const imageUrl = `${process.env.EXPO_PUBLIC_PB_URI}/api/files/drinks/${id}/${image}`;

    // function to format a date
    const formatDate = (date) => {
        if (isToday(date)) {
        return `Today at ${format(date, "h:mm a")}`;
        } 
        if (isYesterday(date)) {
        return `Yesterday at ${format(date, "h:mm a")}`;
        }
        return format(date, "MMMM d, yyyy 'at' h:mm a");
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileContainer}>
                {avatar ? <Image source={{uri: avatar}} style={styles.profileImage} /> : <Ionicons name='person-circle-outline' size={35} color='grey' />}
                <View style={styles.profileInfoContainer}>
                    <Text style={styles.userName}>{name}</Text>
                    <Text style={styles.dateText}>{formatDate(created)}</Text>
                </View>
                {postUser === user?.id ?
                <Pressable
                    style={styles.optionsButton}
                    onPress={() => handleDelete(id)}
                >
                    <Ionicons name='ellipsis-horizontal' size={18} />
                </Pressable>
                : ''}
            </View>
            <Text style={styles.title}>{title}</Text>
            {beans ? <Text style={styles.beans}>{beans}</Text> : ''}
            {notes ? <Text style={styles.notes}>{notes}</Text> : ''}
            <View style={styles.infoContainer}>
                <View style={styles.infoItemContainer}>
                    <Text style={styles.infoLabel}>Dose</Text>
                    <Text style={styles.infoValue}>{inWeight} g</Text>
                </View>
                <View style={styles.infoItemContainer}>
                    <Text style={styles.infoLabel}>Yield</Text>
                    <Text style={styles.infoValue}>{outWeight} g</Text>
                </View>
                <View style={styles.infoItemContainer}>
                    <Text style={styles.infoLabel}>Brew Time</Text>
                    <Text style={styles.infoValue}>{time} s</Text>
                </View>
                <View style={styles.infoItemContainer}>
                    <Text style={styles.infoLabel}>Grind Size</Text>
                    <Text style={styles.infoValue}>{grindSize}</Text>
                </View>
            </View>        

            {image ? <Image source={{ uri: imageUrl }} style={styles.image} /> : ''}
    
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        width: '100%',
        padding: 15,
        borderRadius: 8,
        marginTop: 5
    },
    leftContainer: {
        flex: 1
    },
    profileContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10
    },
    profileInfoContainer: {
        justifyContent: 'center',
        gap: 2
    },
    profileImage: {
        height: 40,
        width: 40,
        borderRadius: "50%"
    },
    optionsButton: {
        marginLeft: 'auto',
        alignItems: 'start',
        justifyContent: 'start',
        paddingLeft: 10
    },  
    userName: {
        fontWeight: 'bold'
    },
    dateText: {
        color: 'grey',
        fontSize: 12
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    beans: {
        color: 'grey',
        marginTop: 2
    },
    notes: {
        marginTop: 5,
        fontSize: 14,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    infoItemContainer: {
        alignItems: 'center',
        gap: 2
    },
    infoLabel: {
        fontSize: 11
    },
    infoValue: {
        fontWeight: 'bold'
    },
    image: {
        width: "100%",
        borderRadius: 8,
        aspectRatio: 1,
        marginTop: 20
    }
});