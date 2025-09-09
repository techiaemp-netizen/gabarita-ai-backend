import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, LoginCredentials } from '@/types';

export interface FirebaseUserData {
  uid: string;
  email: string;
  nome: string;
  cpf: string;
  telefone?: string;
  conteudoEditalId: string;
  cargoId: string;
  grupoId: string;
  planId?: string;
  paymentStatus?: 'active' | 'pending' | 'overdue' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

class FirebaseService {
  // Autenticar usuário
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      // Buscar dados do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados');
      }
      
      const userData = userDoc.data() as FirebaseUserData;
      
      const user: User = {
        uid: userData.uid,
        email: userData.email,
        name: userData.nome,
        cpf: userData.cpf,
        phone: userData.telefone,
        conteudoEditalId: userData.conteudoEditalId,
        cargoId: userData.cargoId,
        grupoId: userData.grupoId,
        planId: userData.planId || 'free',
        paymentStatus: userData.paymentStatus || 'pending'
      };
      
      return { user, token };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }
  
  // Registrar novo usuário
  async signup(userData: {
    email: string;
    password: string;
    nome: string;
    cpf: string;
    telefone?: string;
    conteudoEditalId: string;
    cargoId: string;
    grupoId: string;
    plano?: string;
  }): Promise<{ user: User; token: string }> {
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      // Dados do usuário para o Firestore
      const firestoreUserData: FirebaseUserData = {
        uid: firebaseUser.uid,
        email: userData.email,
        nome: userData.nome,
        cpf: userData.cpf,
        telefone: userData.telefone,
        conteudoEditalId: userData.conteudoEditalId,
        cargoId: userData.cargoId,
        grupoId: userData.grupoId,
        planId: userData.plano || 'free',
        paymentStatus: userData.plano && userData.plano !== 'free' ? 'pending' : 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Salvar dados do usuário no Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), firestoreUserData);
      
      const user: User = {
        uid: firestoreUserData.uid,
        email: firestoreUserData.email,
        name: firestoreUserData.nome,
        cpf: firestoreUserData.cpf,
        phone: firestoreUserData.telefone,
        conteudoEditalId: firestoreUserData.conteudoEditalId,
        cargoId: firestoreUserData.cargoId,
        grupoId: firestoreUserData.grupoId,
        planId: firestoreUserData.planId,
        paymentStatus: firestoreUserData.paymentStatus
      };
      
      return { user, token };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    }
  }
  
  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  }
  
  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      return null;
    }
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data() as FirebaseUserData;
    
    return {
      uid: userData.uid,
      email: userData.email,
      name: userData.nome,
      cpf: userData.cpf,
      phone: userData.telefone,
      conteudoEditalId: userData.conteudoEditalId,
      cargoId: userData.cargoId,
      grupoId: userData.grupoId,
      planId: userData.planId || 'free',
      paymentStatus: userData.paymentStatus || 'pending'
    };
  }
  
  // Atualizar dados do usuário
  async updateUser(uid: string, updates: Partial<FirebaseUserData>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    }, { merge: true });
  }
  
  // Buscar grupos por conteúdo de edital
  async getGruposByConteudoEdital(conteudoEditalId: string) {
    const gruposRef = collection(db, 'grupos');
    const q = query(gruposRef, where('conteudoEditalId', '==', conteudoEditalId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  
  // Buscar cargos por grupo
  async getCargosByGrupo(grupoId: string) {
    const cargosRef = collection(db, 'cargos');
    const q = query(cargosRef, where('grupoId', '==', grupoId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  
  // Observer para mudanças de autenticação
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export const