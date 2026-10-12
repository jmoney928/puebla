export type Cat = "pyramid" | "trip" | "city" | "food" | "gym" | "night" | "travel" | "free";
export type Block = [number, number, Cat, string, string];
export type Day = {
  d: number; dow: string; title: string; sub: string;
  tags: [string, string][];
  cls: { s: number; e: number } | null;
  skip?: boolean;
  blocks: Block[];
  backup?: string;
};

export const CATS: Record<Cat, { label: string }> = {
  pyramid: { label: "Pyramids" }, trip: { label: "Day trip" }, city: { label: "City / culture" }, food: { label: "Food" },
  gym: { label: "Gym" }, night: { label: "Night out" }, travel: { label: "Travel" }, free: { label: "Free time" },
};

const MON = { s: 13, e: 17 + 40 / 60 }, TUE = { s: 13, e: 15.75 };

// [start hour, end hour (24+ = after midnight), category, title, detail]
export const DAYS: Day[] = [
 {d:19,dow:"Mon",title:"Llegada",sub:"Land CDMX 11:30 pm",tags:[["travel","Late arrival"]],cls:MON,blocks:[
  [23.5,26,"travel","Land CDMX 11:30 pm → Uber to Puebla","Land at 11:30 pm, clear customs, then Uber to Puebla. Late at night it’s roughly 2–2.5 h, so you’re in around 2 am. Tell the Airbnb host you’re checking in late. Estrella Roja also runs direct airport-to-Puebla buses if Uber pricing is ugly."]
 ]},
 {d:20,dow:"Tue",title:"Sleep in + Centro",sub:"Slow start · old town",tags:[["chill","Chill night"]],cls:TUE,blocks:[
  [6,11,"free","Sleep in","You rolled in around 2 am. No alarm."],
  [11.25,12.75,"food","Late breakfast with Patrick","Chilaquiles or molotes before he heads to class at 1."],
  [13,15.5,"city","Old town walk","Zócalo and Cathedral, Capilla del Rosario (the gold-leaf chapel in Santo Domingo), Biblioteca Palafoxiana, then Calle de los Dulces for camotes and tortitas de Santa Clara. Find the closest grocery store on the way back."],
  [15.75,16.75,"gym","Gym, light","First session at ~2,150 m on short sleep. Keep it easy."],
  [17.25,19,"city","Sunset on the Estrella de Puebla","Meet Patrick, walk Paseo San Francisco, ride the giant Ferris wheel around sunset (~6:30 pm)."],
  [19.5,21,"food","Tacos árabes","Puebla invented them: spit-roasted pork in pan árabe. Antigua Taquería La Oriental is the classic. Early night after."]
 ]},
 {d:21,dow:"Wed",title:"Pyramid #1: Cholula",sub:"Great Pyramid · Cholula night",tags:[["pyramid","Pyramid"],["night","Night out"]],cls:MON,blocks:[
  [6,9.75,"free","Sleep in",""],
  [10.25,12.25,"pyramid","Great Pyramid of Cholula","20 min from the Centro, so still home turf. The largest pyramid on Earth by volume, mostly buried under a hill. Walk the excavated side, then climb to the Santuario de los Remedios on top for the view over both towns and, on a clear day, Popocatépetl. Open Wed–Sun 9–5."],
  [12.25,13,"food","Quick lunch in San Pedro Cholula","Patrick heads to class from here."],
  [13.5,17.5,"free","Free time","Work, soccer, nap. Patrick’s in class till 5:40. If you want something, Talavera Uriarte runs pottery workshop tours (book ahead)."],
  [19,20.5,"food","Dinner in Cholula",""],
  [20.75,25,"night","Night out in Cholula","Cholula is the student town, with bars stacked within walking distance. Uber back to Puebla is ~20 min."]
 ]},
 {d:22,dow:"Thu",title:"Africam + Thursday night",sub:"Safari · night out · Patrick skips",tags:[["trip","Safari"],["skip","Patrick skips class"],["night","Night out"]],cls:TUE,skip:true,blocks:[
  [6,9.5,"free","Sleep in","Recover from Cholula."],
  [10,10.75,"travel","Uber south","30–40 min to the park."],
  [10.75,14.25,"trip","Africam Safari","Drive-through safari where giraffes, rhinos and zebras walk right up to the vehicle, then the walking zone. Opens 10 am on weekdays, ~400 MXN per adult. You can drive your own car through; without one, use the park’s safari vehicles."],
  [14.5,15.5,"food","Late lunch","Cemitas back in town."],
  [16,17.25,"gym","Gym",""],
  [17.25,19.5,"free","Free time","Work, soccer, whatever."],
  [19.75,20.75,"food","Dinner",""],
  [21,25.5,"night","Thursday night out","Centro rooftops and bars. Friday’s Teotihuacan drive is easier on a slow morning, so leave by 8:30 and nap in the car."]
 ]},
 {d:23,dow:"Fri",title:"Pyramid #2: Teotihuacan",sub:"Big day trip · easy night",tags:[["pyramid","Pyramid"],["chill","Easy night"]],cls:null,blocks:[
  [8.5,11,"travel","Drive to Teotihuacan","About 2.5 h. Hire a driver or rent a car. Up at 8, rolling by 8:30. Sleep in the car."],
  [11,15,"pyramid","Teotihuacan","Walk the Avenue of the Dead, see the Pyramid of the Sun from its base, the Temple of the Feathered Serpent, and the murals museum. You’ll be there through midday with no shade: hat, sunscreen, water."],
  [15,16.25,"food","Late lunch at La Gruta","Restaurant set inside a cave, a few minutes from the site."],
  [16.25,19,"travel","Drive back","About 2.5 h. Friday afternoon traffic around CDMX can stretch it to 3."],
  [20,22.5,"night","Low-key drinks","A mezcalería or rooftop in the Centro, close to home. No clubs, no plans, bail whenever."]
 ],backup:"If the day wipes you out, skip drinks entirely and order in. Saturday is a late one."},
 {d:24,dow:"Sat",title:"Atlixco + Catrinas",sub:"Day of the Dead night",tags:[["trip","Day trip"],["night","Night out"]],cls:null,blocks:[
  [6,10.5,"free","Sleep in",""],
  [10.75,11.75,"gym","Gym",""],
  [12,13.25,"food","Chilaquiles brunch",""],
  [13.5,14.25,"travel","Drive to Atlixco","About 40 min."],
  [14.25,17.75,"trip","Atlixco","Pueblo mágico at the foot of Popocatépetl. Climb Cerro de San Miguel for the view, eat nieves on the zócalo, find the 8 m catrinas around town."],
  [18,21.5,"night","Valle de Catrinas","6th edition runs Oct 9 – Nov 8. The 24th is a Catrinia show night: parade (~1 h 15), marigold tunnels, videomapping every 30 min from 6 pm. Tickets 400–900 MXN. Buy ahead."],
  [22,25.5,"night","Saturday night out","Back in Puebla. Go as hard as you want, Alpinia doesn’t start till 10."]
 ]},
 {d:25,dow:"Sun",title:"Alpinia",sub:"Adventure park · Izta slopes",tags:[["trip","Adventure park"],["chill","Chill night"]],cls:null,blocks:[
  [6,9.5,"free","Sleep in",""],
  [10,11.25,"travel","Drive to Alpinia","About 70 km toward CDMX, 1–1.25 h. The last stretch of access road is rough."],
  [11.25,16.25,"trip","Alpinia Nature & Adventure Park","On the slopes of Iztaccíhuatl. Billed as Mexico’s biggest hedge maze, plus zip lines, a high-ropes course, obstacle course, trails and mini golf. Zip lines and the restaurant run weekends only, so Sunday is the day. Book online ahead. Bring a jacket: it’s cold up there."],
  [16.25,17.5,"travel","Drive back",""],
  [17.5,19,"free","Free time","Work, soccer, laundry."],
  [19.25,21,"food","Mole dinner","Mole poblano at a classic fonda."]
 ]},
 {d:26,dow:"Mon",title:"Tlaxcala + Lucha",sub:"Cacaxtla · lucha libre · Patrick skips",tags:[["pyramid","Pyramid"],["skip","Patrick skips class"],["night","Lucha libre"]],cls:MON,skip:true,blocks:[
  [6,9.75,"free","Sleep in",""],
  [10.25,14,"pyramid","Pyramid #3: Cacaxtla + Xochitécatl","45 min away in Tlaxcala. Cacaxtla has some of the best-preserved pre-Hispanic murals in Mexico, under a huge protective roof. Xochitécatl, next door, has its own pyramids. Open daily 9–5."],
  [14.25,15.75,"food","Lunch in Tlaxcala city","Small, colorful colonial center. Worth a lap."],
  [16.5,19,"free","Free time","Work, soccer, nap."],
  [19,19.75,"food","Quick dinner",""],
  [20,22.5,"night","Lucha libre, Arena Puebla","CMLL’s Lunes Clásico runs Mondays at 8 pm. Tickets at the box office or Ticketmaster. Buying a mask from the vendors outside is basically mandatory."]
 ],backup:"Want more out of the day? Add Val’Quirico, a walkable Tuscan-style village about 20 min from Tlaxcala."},
 {d:27,dow:"Tue",title:"Barrios + cantinas",sub:"Free morning · last night out",tags:[["night","Last night out"]],cls:TUE,blocks:[
  [6,10,"free","Sleep in",""],
  [10.25,13,"free","Free time","Work, soccer, errands. Patrick has class at 1."],
  [13.25,14.5,"gym","Gym",""],
  [14.75,16.5,"city","Museo Internacional del Barroco","Toyo Ito’s white building in Angelópolis."],
  [17,18.75,"city","Xanenetla murals","Street-art barrio a few blocks from the Centro. Best in late-afternoon light."],
  [19,20.25,"food","Dinner",""],
  [20.5,25,"night","Last night out: cantina crawl","Start with a shot at La Pasita, Puebla’s tiny classic liquor bar, then work through the Centro. Tomorrow is a travel day, so don’t go full send."]
 ]},
 {d:28,dow:"Wed",title:"Salida",sub:"Leave Puebla 5 pm · fly 12:30 am",tags:[["travel","Departure"]],cls:MON,blocks:[
  [6,9.5,"free","Sleep in",""],
  [9.75,10.5,"travel","Pack + check out","Ask the host if you can leave bags until 5."],
  [10.5,11.75,"city","Museo Amparo + El Parián","Quick lap of the Amparo’s rooftop café over the church domes, then last Talavera and dulces at El Parián."],
  [11.75,12.85,"food","Farewell lunch with Patrick","He’s in class 1–5:40, so this is the goodbye."],
  [13.25,16.5,"city","Last wander","Día de Muertos altars and marigolds will be going up around the Centro. Grab cemitas for the road."],
  [17,20.25,"travel","Uber to CDMX airport","Budget 2.5–3 h in evening traffic into the city. Leave by 5 pm at the latest."],
  [20.25,24.5,"travel","Check in → flight 12:30 am","At the airport ~3 h before an international flight. Wheels up 12:30 am on the 29th."]
 ]}
];

export const H0 = 6, H1 = 26, SPAN = H1 - H0;
export const pct = (h: number) => ((h - H0) / SPAN * 100).toFixed(3) + "%";
export const fmt = (h: number) => {
  let hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  if (mm === 60) { hh++; mm = 0; }
  const d = hh % 24, ap = d < 12 ? "am" : "pm", h12 = (d % 12) || 12;
  return h12 + (mm ? ":" + String(mm).padStart(2, "0") : "") + " " + ap;
};
