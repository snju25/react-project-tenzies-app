import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function App() {

    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [countRolls, setCountRolls] = React.useState(0)
    const [timer,setTimer] = React.useState(0)
    const [timerStarted, setTimerStarted] = React.useState(false)
    const [winningTimes, setWinningTimes ] = React.useState(()=> JSON.parse(localStorage.getItem('winningTimes')) || [])
    

    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            const updateWinningTimes = [...winningTimes,timer].sort((a, b) => a - b)
            setWinningTimes(updateWinningTimes)
            localStorage.setItem('winningTimes',JSON.stringify(updateWinningTimes))
        }
    }, [dice])

    

    React.useEffect(()=>{
        let interval;
        if(timerStarted && !tenzies){
            interval = setInterval(()=>{
                setTimer(prevTimer => prevTimer +1)
            },1000)
        }
        return ()=> clearInterval(interval)
    }, [timerStarted, tenzies])
    


    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if(!tenzies) {
            if (!timerStarted) {
                setTimerStarted(true);
            }
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
            setCountRolls(prevCount => prevCount + 1);
        } else {
            setTimerStarted(false)
            setTenzies(false)
            setDice(allNewDice())
            setCountRolls(0)
            setTimer(0)
            
        }
    }
    
    function holdDice(id) {
        if (!timerStarted) {
            setTimerStarted(true);
        }
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
            {!tenzies 
            ?
            <div style={{textAlign:"center"}}>
                <h2>The total number of rolls : {countRolls}</h2> 
                <h2>The timer : {timer} secs</h2>
                <p>The timer starts when you first hold a dice or if you roll all dices</p>
            </div> 
            : 
            <div style={{textAlign:"center"}}>
                <h2>You won in : {countRolls} rolls and {timer} secs</h2> 

            </div>}
            {winningTimes.length > 0 && <h2>Best Winning Time : {winningTimes[0]} secs</h2>}
            
        </main>
    )
}