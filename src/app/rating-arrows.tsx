type RatingKey = 'skill'|'speed'|'vision'|'passing';

export default function RatingArrows({name,label,value=3}:{name:RatingKey;label:string;value?:number}) {
  return <fieldset className="rating-field"><legend>{label}</legend><div className="rating-arrows" role="radiogroup" aria-label={`${label}, nota de 1 a 5`}>
    {[5,4,3,2,1].map(n=><label key={n} title={`${n} de 5`}><input type="radio" name={name} value={n} defaultChecked={value===n} required aria-label={`${n} de 5`}/><span aria-hidden="true"/></label>)}
  </div><small>1 básico · 5 excelente</small></fieldset>;
}
