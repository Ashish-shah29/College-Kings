
exports.convertSecondsToDuration = (totalDurationSecond) =>{
  let hours = Math.floor((totalDurationSecond)/3600);
  let minutes = Math.floor((totalDurationSecond %3600)/60);
  let seconds = Math.floor((totalDurationSecond%3600)%60);

  if(hours>0){
    return `${hours}hr ${minutes}min`
  }else if(minutes >0){
    return `${minutes}min ${seconds}sec`
  }else{
    return `${seconds}sec`
  }
}