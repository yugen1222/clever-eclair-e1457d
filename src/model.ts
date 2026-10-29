export type Dish={id:string;name:string;category:string;icon:string;scope?:"service"|"bar"};
export type Config={zones:Record<string,string[]>;dishes:Dish[];runners:string[];warning:number;critical:number;catalogVersion?:number};
export type Item={id:string;name:string;qty:number};
export type Order={id:string;floor:number;zone:string;items:Item[];status:string;runner:string;urgent:number;comment:string;created:number;updated:number;version:number;events:{at:number;text:string}[]};
export const statuses:Record<string,string>={new:'Новая',assigned:'Принято',transit:'Принято',delivered:'Отправлено',cancelled:'Отменена'};
export const defaults:Config={zones:{'1':['Бар','Магазин'],'2':[],'3':['Зона A','Зона B','Зона C','Бар']},runners:[],warning:3,critical:5,catalogVersion:2,dishes:[
  {
    "id": "plate-main",
    "name": "Сервировочные тарелки большие",
    "category": "Тарелки",
    "icon": "plate",
    "scope": "service"
  },
  {
    "id": "plate-dessert",
    "name": "Сервировочные тарелки маленькие",
    "category": "Тарелки",
    "icon": "plate",
    "scope": "service"
  },
  {
    "id": "fork",
    "name": "Сервировочные вилки",
    "category": "Приборы",
    "icon": "fork",
    "scope": "service"
  },
  {
    "id": "spoon",
    "name": "Столовые ложки",
    "category": "Приборы",
    "icon": "spoon",
    "scope": "service"
  },
  {
    "id": "knife",
    "name": "Сервировочные ножи",
    "category": "Приборы",
    "icon": "fork",
    "scope": "service"
  },
  {
    "id": "steak-knife",
    "name": "Стейк-ножи",
    "category": "Приборы",
    "icon": "fork",
    "scope": "service"
  },
  {
    "id": "teaspoon",
    "name": "Ложки для чая",
    "category": "Приборы",
    "icon": "spoon",
    "scope": "service"
  },
  {
    "id": "dessert-fork",
    "name": "Вилки десертные",
    "category": "Приборы",
    "icon": "fork",
    "scope": "service"
  },
  {
    "id": "cup",
    "name": "Чашки",
    "category": "Чашки и стаканы",
    "icon": "cup",
    "scope": "service"
  },
  {
    "id": "rocks",
    "name": "Роксы",
    "category": "Чашки и стаканы",
    "icon": "glass",
    "scope": "service"
  },
  {
    "id": "bar-cup",
    "name": "Чашки",
    "category": "Чашки",
    "icon": "cup",
    "scope": "bar"
  },
  {
    "id": "bar-double-cup",
    "name": "Чашки дабл",
    "category": "Чашки",
    "icon": "cup",
    "scope": "bar"
  },
  {
    "id": "bar-espresso-cup",
    "name": "Чашки для эспрессо",
    "category": "Чашки",
    "icon": "cup",
    "scope": "bar"
  },
  {
    "id": "bar-irish",
    "name": "Айриш",
    "category": "Стаканы",
    "icon": "glass",
    "scope": "bar"
  },
  {
    "id": "bar-rocks",
    "name": "Роксы",
    "category": "Стаканы",
    "icon": "glass",
    "scope": "bar"
  },
  {
    "id": "bar-glass-03",
    "name": "Стаканы 0,3",
    "category": "Стаканы",
    "icon": "glass",
    "scope": "bar"
  },
  {
    "id": "bar-white-teapot",
    "name": "Белые чайники",
    "category": "Чайники",
    "icon": "cup",
    "scope": "bar"
  },
  {
    "id": "bar-teapot-saucer",
    "name": "Блюдца под чайники",
    "category": "Чайники",
    "icon": "plate",
    "scope": "bar"
  },
  {
    "id": "bar-special-teapot",
    "name": "Спешл чайник",
    "category": "Чайники",
    "icon": "cup",
    "scope": "bar"
  },
  {
    "id": "bar-latte-spoon",
    "name": "Ложки для латте",
    "category": "Приборы",
    "icon": "spoon",
    "scope": "bar"
  }
]};
export function active(o:Order){return !['delivered','cancelled'].includes(o.status)}
export function demoOrders():Order[]{const now=Date.now();return [
{floor:1,zone:'Бар',items:[{id:'cup',name:'Чашки',qty:12},{id:'bar-teapot-saucer',name:'Блюдца под чайники',qty:12}],status:'new',runner:'',urgent:0,comment:'Для подачи чая',age:95},
{floor:1,zone:'Магазин',items:[{id:'plate-main',name:'Сервировочные тарелки большие',qty:20},{id:'fork',name:'Сервировочные вилки',qty:20}],status:'assigned',runner:'',urgent:0,comment:'',age:220},
{floor:3,zone:'Зона B',items:[{id:'plate-dessert',name:'Сервировочные тарелки маленькие',qty:15},{id:'teaspoon',name:'Ложки для чая',qty:15}],status:'new',runner:'',urgent:1,comment:'Закончились в зоне',age:360},
{floor:3,zone:'Бар',items:[{id:'bar-glass-03',name:'Стаканы 0,3',qty:10}],status:'assigned',runner:'',urgent:0,comment:'',age:140}
].map((r,i)=>({...r,id:'example-'+(i+1),created:now-r.age*1000,updated:now,version:1,events:[{at:now-r.age*1000,text:'Заявка создана'}]}))}

export function upgradeConfig(c:Config):Config{const next=(c.catalogVersion||0)<2?{...c,dishes:defaults.dishes,catalogVersion:2}:c;return {...next,zones:{...next.zones,'2':[]},runners:[]}}
export function canTransition(current:string,next:string){return ({new:['assigned','cancelled'],assigned:['delivered','cancelled'],transit:['delivered','cancelled'],delivered:[],cancelled:[]} as Record<string,string[]>)[current]?.includes(next)||false}
export function zoneDishes(c:Config,zone:string){const bar=zone.trim().toLocaleLowerCase("ru-RU")==="бар";return c.dishes.filter(d=>!d.scope||d.scope===(bar?"bar":"service"))}
