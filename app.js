const express = require('express');
const { getApps, initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var firebaseConfig = {
    apiKey: "AIzaSyB3HsuYXEBZurfTkDHbctuwGdpYXsXwG-k",
    authDomain: "persistencia-455b1.firebaseapp.com",
    projectId: "persistencia-455b1",
    storageBucket: "persistencia-455b1.appspot.com",
    messagingSenderId: "178907863479",
    appId: "1:178907863479:web:b64e7dd906abbd7b663032"
};

// arquivo estático
app.use(express.static(__dirname + 'public'));

const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } = require('firebase/firestore');
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/login', async (req, res) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, req.body.email, req.body.password);
        console.log(userCredential);
        res.redirect('/home');
    } catch (error) {
        res.send(error.message);
    }
});


app.get('/home', (req, res) => {
    const user = auth.currentUser;
    console.log(user);
    if (user) {
        res.render('home', { user: user });
    } else {
        res.redirect('/');
    }
});

app.get('/add-curso', (req, res) => {
    res.render('add-curso');
});

//adicionar curso
app.post('/add-curso', async (req, res) => {
    try {
        const docRef = await addDoc(collection(db, 'curso'), {
            carga_horaria: req.body.carga_horaria,
            turno: req.body.turno,
            professor: req.body.professor,
            disciplina: req.body.disciplina
        });
        res.redirect('/list-cursos');
    } catch (e) {
        res.send(e.message);
    }
});

//listar curso
app.get('/list-cursos', async (req, res) => {
    const querySnapshot = await getDocs(collection(db, 'curso'));
    const cursos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.render('list-cursos', { cursos });
});

//editar curso
app.get('/edit-curso/:id', async (req, res) => {
    const docRef = doc(db, 'curso', req.params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        res.render('edit-curso', { curso: { id: docSnap.id, ...docSnap.data() } });
    } else {
        res.send("No such document!");
    }
});

app.post('/edit-curso/:id', async (req, res) => {
    const docRef = doc(db, 'curso', req.params.id);
    await updateDoc(docRef, {
        carga_horaria: req.body.carga_horaria,
        turno: req.body.turno,
        professor: req.body.professor,
        disciplina: req.body.disciplina
    });
    res.redirect('/list-cursos');
});

//remover curso
app.post('/delete-curso/:id', async (req, res) => {
    const docRef = doc(db, 'curso', req.params.id);
    await deleteDoc(docRef);
    res.redirect('/list-cursos');
});

app.listen(3000, () => console.log('Server started on port 3000'));