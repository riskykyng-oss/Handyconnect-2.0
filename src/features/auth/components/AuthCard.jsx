import Card from "@/components/ui/Card";


export default function AuthCard({children}){


return(

<div
className="
min-h-screen
bg-slate-50
flex
items-center
justify-center
px-4
"
>

<Card
className="
w-full
max-w-md
"
>

{children}

</Card>

</div>

)

}