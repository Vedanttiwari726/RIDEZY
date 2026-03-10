import { NavLink, useLocation } from "react-router-dom"
import { Home, Clock, Grid, User } from "lucide-react"

export default function BottomTabs(){

const location = useLocation()

const tabs = [
{ name:"Home", path:"/home", icon:Home },
{ name:"Activity", path:"/activity", icon:Clock },
{ name:"Services", path:"/services", icon:Grid },
{ name:"Profile", path:"/profile", icon:User }
]

/* hide bottom tabs on public pages */

const hideRoutes = ["/", "/login", "/signup", "/captain-login", "/captain-signup"]

if(hideRoutes.includes(location.pathname)) return null

return(

<div className="
fixed bottom-5 left-1/2 -translate-x-1/2
w-[92%] max-w-md
bg-white/10 backdrop-blur-xl
border border-white/10
rounded-3xl
shadow-[0_10px_40px_rgba(0,0,0,0.6)]
flex justify-around items-center
py-3 z-50
">

{tabs.map(tab=>{

const Icon = tab.icon

return(

<NavLink
key={tab.name}
to={tab.path}
className={({isActive}) =>
`flex flex-col items-center text-xs transition-all duration-300
${isActive
? "text-green-400 scale-110"
: "text-gray-400 hover:text-white"}`
}
>

<Icon size={22}/>

<span className="mt-1">{tab.name}</span>

</NavLink>

)

})}

</div>

)
}