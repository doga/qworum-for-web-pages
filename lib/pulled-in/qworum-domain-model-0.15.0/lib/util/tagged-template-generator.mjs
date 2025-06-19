function taggedTemplateGenerator(classOfOutput) {
  return (strings, ...values) => {
    let res = strings[0], i=1; 
    for (const v of values){
      res+=`${v}${strings[i]}`;i++;
    }
    try {
      return new classOfOutput(res);
    } catch (_error) {
      return null;
    }
  }
}
export default taggedTemplateGenerator;
export { taggedTemplateGenerator };
