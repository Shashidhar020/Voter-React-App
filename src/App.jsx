import { useEffect, useState } from 'react';
import './style.css';

function App() {
  const [c1, setC1] = useState(0);
  const [c2, setC2] = useState(0);
  const [c3, setC3] = useState(0);
  const [leader, setLeader] = useState('');

  const totalVotes = c1 + c2 + c3;

  const getPercentage = (votes) => {
    return totalVotes === 0 ? 0 : ((votes / totalVotes) * 100).toFixed(1);
  };

  useEffect(() => {
    if (c1 > c2 && c1 > c3) {
      setLeader('Ramesh');
    } else if (c2 > c1 && c2 > c3) {
      setLeader('Sharath');
    } else if (c3 > c1 && c3 > c2) {
      setLeader('Shashidhara');
    } else {
      setLeader('ReVote');
    }
  }, [c1, c2, c3]);

  const resetVotes = () => {
    setC1(0);
    setC2(0);
    setC3(0);
  };

  return (
    <div className="container">
      <h1 className="title blink">🗳️ Voting App</h1>
      <p className="total">Total Votes: {totalVotes}</p>

      <div className="card-container">
        <VoteCard
          name="Ramesh"
          count={c1}
          onVote={() => setC1(c1 + 1)}
          percentage={getPercentage(c1)}
          isLeader={leader === 'Suresh'}
        />
        <VoteCard
          name="Sharath"
          count={c2}
          onVote={() => setC2(c2 + 1)}
          percentage={getPercentage(c2)}
          isLeader={leader === 'Sharath'}
        />
        <VoteCard
          name="Shashidhara"
          count={c3}
          onVote={() => setC3(c3 + 1)}
          percentage={getPercentage(c3)}
          isLeader={leader === 'Shashidhara'}
        />
      </div>

      <h2 className="leader blink1">Current Leader: {leader}</h2>

      <button className="reset-btn" onClick={resetVotes}>
        🔄 Reset Votes
      </button>
    </div>
  );
}

function VoteCard({ name, count, onVote, percentage, isLeader }) {
  return (
    <div className={`vote-card ${isLeader ? 'leader-card' : ''}`}>
      <h2>{name}</h2>
      <button onClick={onVote}>Vote</button>
      <p>Votes: {count}</p>
      <div className="progress-bar">
        <div className="fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="percentage">{percentage}%</p>
    </div>
  );
}

export default App;
