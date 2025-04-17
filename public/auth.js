// auth.js
// Configuração do Firebase com valores diretos (substitua por variáveis de ambiente em produção)
export const initializeFirebase = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCTCr2JUHO2Yc1JuTcwkkd682At0lb00Zw",
        authDomain: "agenciaibgeosorioteste.firebaseapp.com",
        projectId: "agenciaibgeosorioteste",
        storageBucket: "agenciaibgeosorioteste.firebasestorage.app",
        messagingSenderId: "976519041511",
        appId: "1:976519041511:web:32014eac776c4cab3ced42",
        measurementId: "G-S6196T35Y2"
    };

    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);

    return {
        db: firebase.firestore(),
        auth: firebase.auth()
    };
};