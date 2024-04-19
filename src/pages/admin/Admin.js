import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from '../../components/allUsers/Users';
import styles from './Admin.module.css';
import useAuth from '../../hooks/useAuth';
import useCollection from '../../hooks/useCollection';
import { TextField } from '@mui/material';
import { db } from '../../firebase/config';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import DashboardNav from '../../components/dashboardNav/DashboardNav';
import emailjs from '@emailjs/browser';
import dateFormat from "dateformat";
import Button from '@mui/material/Button';
import { MdDeleteForever } from "react-icons/md"
// import { deleteUser, getAuth } from "@firebase/auth";

export default function Admin() {
  const { document: Document, error, isPending } = useCollection('profile', true, false);
  const { user, authIsReady } = useAuth();
  const [singleDoc, setSingleDoc] = useState(null);
  const [balance, setBalance] = useState(null);
  const [profit, setProfit] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [withdrawal, setWithdrawal] = useState(null);
  const [savings, setSavings] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [email, setEmail] = useState(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate()


  useEffect(() => {
    if(user?.email !== 'trustsolidfx@gmail.com'){
      navigate('/dashboard')
    }

    const chatDiv = document.getElementById('tidio-chat')
    if(chatDiv){
      // chatDiv.style.display = 'none';
    }


    return () => {
      if(chatDiv){
        chatDiv.style.display = 'block';
      }
    }
  }, [user]);

  
  const sendMessage = (amount, name, email) => {
    var templateParams = {
      amount,
      name,
      email,
      date: dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss"),
      title: "Deposit"
    };
 
    emailjs.send('service_2sn4xvp', 'template_j0ixiwl', templateParams, '6DdKsMl4BaIFww4Tv')
    .then((result) => {
        console.log("result", result.text);
    }, (error) => {
        console.log("error", error.text);
    });
  }


  
const filter = (email) => {
  console.log(Document, email)
  let filteredDoc = Document.filter((doc) => doc.email === email)
  setSingleDoc(filteredDoc[0])
  setBalance(filteredDoc[0].bal.balance)
  setProfit(filteredDoc[0].bal.profit)
  setInvestment(filteredDoc[0].bal.investment)
  setWithdrawal(filteredDoc[0].bal.withdrawal)
  setSavings(filteredDoc[0].bal.savings)
  setDisplayName(filteredDoc[0].displayName)
  setEmail(filteredDoc[0].email)
}

const handleSubmit = async(e) => {
  const ref = doc(db, "profile", email);
  setPending(true)
  e.preventDefault()

  const newBalances = {
    balance: Number(balance),
    investment: Number(investment),
    profit: Number(profit),
    savings: Number(savings),
    withdrawal: Number(withdrawal),
  }

  await updateDoc(ref, {
    "bal": newBalances
  });

  let filteredDoc = Document.filter((doc) => doc.email === email)

  if(filteredDoc[0].bal.balance !== balance){
    sendMessage(balance, filteredDoc[0].fullName, filteredDoc[0].email)
  }

  setMessage("Updated successfully")
  setPending(false)
  setTimeout(() => {
    setMessage(null)
  }, 2000)
}

const deleteUserDocument = async () => {
  // const removeUser = getAuth.getUserByEmail(email)
  // await deleteUser(removeUser)
  await deleteDoc(doc(db, "profile", email));
  setSingleDoc(null)
  console.log("Done deleting")
}




  return ((authIsReady && user?.email === "trustsolidfx@gmail.com") && 
    <div className={styles.container}>
      <DashboardNav admin={true}/>
      <Users document={Document} error={error} isPending={isPending} filter={filter}/>

      {singleDoc &&
      <div className={styles.singleUser}>
        <form onSubmit={handleSubmit} className={styles.card}>
          <h1>{displayName}</h1>
          <p>{email}</p>
          <TextField 
          type="number" 
          fullWidth 
          label="Balance" 
          value={balance} 
          onChange={(e) => setBalance(e.target.value)}/>
          <TextField 
          type="number" 
          fullWidth 
          label="Profit" 
          value={profit} 
          onChange={(e) => setProfit(e.target.value)}/>
          <TextField 
          type="number" 
          fullWidth 
          label="Investment" 
          value={investment} 
          onChange={(e) => setInvestment(e.target.value)}/>
          <TextField 
          type="number" 
          fullWidth 
          label="Withdrawal" 
          value={withdrawal} 
          onChange={(e) => setWithdrawal(e.target.value)}/>
          <TextField 
          type="number" 
          fullWidth 
          label="Savings" 
          value={savings} 
          onChange={(e) => setSavings(e.target.value)}/>
          <button 
          className={styles.btn}
          type='submit'>
            {pending? "Updating...": message? `${message}`: "Update"}
          </button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<MdDeleteForever />}
            onClick={deleteUserDocument}
            >
            Delete User
        </Button>
        </form>
      </div>
      }
    </div>
  )
}
