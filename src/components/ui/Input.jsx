export default function Input({
  label,
  type="text",
  ...props
}) {

return (

<div className="space-y-2">

<label className="
text-sm
font-medium
text-gray-700
">
{label}
</label>


<input

type={type}

className="
w-full
rounded-2xl
border
border-gray-200
px-4
py-3
outline-none
focus:ring-2
focus:ring-orange-500
focus:border-transparent
bg-white
"

{...props}

/>

</div>

)

}