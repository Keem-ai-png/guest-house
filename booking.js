import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const form=document.getElementById("bookingForm");
if(form){
 const $=s=>document.querySelector(s);
 const roomSelect=$("#bookingRoom"), summary=$("#paymentSummary"), button=$("#payNowButton"), status=$("#formStatus");
 const supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 let rooms=[];
 const money=n=>new Intl.NumberFormat("en-GH",{style:"currency",currency:"GHS",maximumFractionDigits:2}).format(n);
 const today=new Date(); today.setHours(0,0,0,0);
 $("#arrivalDate").min=today.toISOString().slice(0,10);
 $("#arrivalDate").addEventListener("change",()=>{$("#departureDate").min=$("#arrivalDate").value;calculate();});
 $("#departureDate").addEventListener("change",calculate);
 roomSelect.addEventListener("change",calculate);
 async function loadRooms(){
   roomSelect.innerHTML='<option value="">Loading available rooms…</option>';
   const {data,error}=await supabase.from("rooms").select("id,name,price_ghs,max_guests,available").eq("available",true).order("name");
   if(error)throw error;
   rooms=(data||[]).filter(r=>Number(r.price_ghs)>0);
   roomSelect.innerHTML='<option value="">Choose a room</option>'+rooms.map(r=>`<option value="${r.id}">${String(r.name).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))} — ${money(Number(r.price_ghs))} / night</option>`).join("");
   if(!rooms.length)roomSelect.innerHTML='<option value="">No bookable rooms yet — please contact the guesthouse</option>';
   calculate();
 }
 function calculate(){
   const room=rooms.find(r=>r.id===roomSelect.value),a=$("#arrivalDate").value,d=$("#departureDate").value;
   if(!room||!a||!d){summary.textContent="Select a room and valid dates to calculate the full amount.";return;}
   const nights=Math.round((new Date(d+"T00:00:00")-new Date(a+"T00:00:00"))/86400000);
   if(nights<1){summary.textContent="Departure must be at least one day after arrival.";return;}
   const total=Number(room.price_ghs)*nights;
   summary.innerHTML=`${nights} night${nights===1?"":"s"} × ${money(Number(room.price_ghs))} per night<br><strong>Full payment: ${money(total)}</strong>`;
 }
 window.addEventListener("keem-select-room",e=>{if(e.detail?.roomId){roomSelect.value=e.detail.roomId;calculate();}});
 form.addEventListener("submit",async e=>{
   e.preventDefault();status.textContent="";
   const f=new FormData(form),room=rooms.find(r=>r.id===f.get("room_id"));
   if(!room){status.textContent="Please choose an available room.";return;}
   const guests=Number(f.get("guests"));
   if(guests<1||guests>Number(room.max_guests||30)){status.textContent=`This room allows up to ${room.max_guests} guests.`;return;}
   const arrival=f.get("arrival"),departure=f.get("departure");
   if(!arrival||!departure||departure<=arrival){status.textContent="Choose a valid arrival and departure date.";return;}
   button.disabled=true;button.textContent="Preparing secure checkout…";
   try{
     const response=await fetch("/api/paystack/initialize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({room_id:room.id,name:f.get("name").trim(),email:f.get("email").trim(),arrival,departure,guests,message:f.get("message").trim()})});
     const result=await response.json();
     if(!response.ok)throw new Error(result.error||"Unable to start payment.");
     location.href=result.authorization_url;
   }catch(err){status.textContent=err.message||"Checkout could not be started. Please try again.";button.disabled=false;button.innerHTML='Continue to secure payment <span>↗</span>';}
 });
 loadRooms().catch(err=>{console.error(err);roomSelect.innerHTML='<option value="">Room list unavailable — contact the guesthouse</option>';status.textContent="Room information could not be loaded.";});
}
