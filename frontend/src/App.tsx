import { useEffect, useState } from "react";
import "./App.css";

type LunchRequest = {
  id: number;
  restaurant: string;
  requestedBy: string;
  volunteers: number;
  drivers: string[];
  passengers: string[];
  postedAt: Date; // posted time
};

// Function to display "time ago" like 15 minutes ago
function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // in minutes
  if (diff < 1) return "just now";
  if (diff === 1) return "1 minute ago";
  if (diff < 60) return `${diff} minutes ago`;
  const hours = Math.floor(diff / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

export type ListData = {
  launches: {
    id: string,
    authorId: string,
    name: string,
    desc: string,
    date: Date,
    time: string,
    takeBack: boolean
  }[],
  participants: {
    id: string,
    launchId: string,
    userId: string,
    isDriver: boolean,
    name: string
  }[]
}

export type MemberData = {
  [index: string]: {
    id: string,
    launchId: string,
    userId: string,
    isDriver: boolean,
    name: string
  }[]
}

async function getLaunchList() {
  const res = await fetch("http://localhost:3000/list")
  const data = (await res.json()) as unknown as ListData

  return data
}

function App() {
  const [time, setTime] = useState(new Date());

  const [requests, setRequests] = useState<ListData>();
  const [unique, setUnique] = useState<string[]>([]);
  const [members, setMembers] = useState<MemberData>({});

  // Update real-time clock
  useEffect(() => {
    async function gll() {
      const ll = await getLaunchList()
      console.log(ll)
      setRequests(ll)
    }
    void gll()
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(()=> {
    let temp:string[] = []
    requests?.participants.forEach((v) => {
      if(!temp.find((n)=>n==v.name))
        temp.push(v.name)
    })

    setUnique(temp)
    ///////
    let tempMember:MemberData = {}

    requests?.launches.forEach((v)=>{
      tempMember[v.id] = []
      requests.participants.forEach((p)=>{
        if(p.launchId == v.id)
          tempMember[v.id].push(p)
      })
    })

    setMembers(tempMember);
  },[requests])

  return (
    <div className="background-container">
      {/* PNG overlay/logo on top-left */}
      

      {/* Main content */}
      <div className="board-content">
        <div className="board-header">
          <div className="title-section">
          <img src="TechLaunchers.svg" />
            <p className="clock">{time.toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="main-content">
          <div className="cards-container">
            {requests?.launches.sort((a,b)=>{
              return members[a.id] && members[b.id] ? members[b.id].length - members[a.id].length : 0 
            }).map((req) => (
              <div key={req.id} className="request-card">
                <div className="card-left">
                  <div className="name-cont">
                    <h2 className="restaurant-name">{req.name}</h2>
                    <p className="time-ago">{req.time.substring(0,5)}</p>
                  </div>
                  <p>Posted by <strong>{requests.participants.find((v)=>v.userId==req.authorId)?.name ?? "Unknown"}</strong></p>
                </div>
                <div className="card-right">
                  {req.desc != "" && <div>{req.desc}</div>}
                  <p>{members[req.id] ? members[req.id].length : 0} launcher(s)</p>
                  <div className="name-cont2">
                    {members[req.id]?.map((v,i)=>{
                      return<div>{`${v.isDriver ? "(D) ": ""}${v.name}${i < members[req.id].length - 1 ? ', ' : ""}`}</div>
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="stable-cont">
            <h3>Stable</h3>
            <div className="stable">
            {
              unique.map((v)=>{
                return<div className="horse">
                  <img width={50} height={50} src="horse.svg"/>
                  {v}
                  </div>
              })
            }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
