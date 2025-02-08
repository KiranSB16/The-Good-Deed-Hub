// import { useDispatch , useSelector } from "react-redux"
// import { fetchAllUsers } from "../slices/userSlice"
// export default function Dashboard(){
//     const dispatch = useDispatch()
//     const {data} = useSelector((state) => {
//         return state.users
//     })
//     const handleClick = (e) => {
//         e.preventDefault()
//         dispatch(fetchAllUsers())


//     }
//     return(
//         <>
//         <h1>Dashboard</h1>
//         <h2>users - {data.length}</h2>
//         <button onClick={handleClick}>Fetch users</button>
//         </>
//     )
// }