import {names, adjectives} from "./usernameData"

const alphaToNumeric = (string) => {
  let numeric = string.toLowerCase().split("").map(char=>{
      return isNaN(char) ? char.charCodeAt(0) - 97 + 1 : char;
  }).join("");
  return parseInt(numeric);
}

const seededRandom = (seed) => {
  if(!seed){
    return Math.random();
  }
  if(isNaN(seed)){
      seed = alphaToNumeric(seed);
  }
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const generator = {
    seed: null,
    adjectives: adjectives,
    names: names,
    separator: "-",
    setAdjectives(adjectives) {
        this.adjectives = adjectives
        return this;
    },
    setNames(name){
        this.names = names
        return this;
    },
    setSeparator(separator) {
        this.separator = separator  
        return this;
    },
    setSeed(seed){
        this.seed = seed;
        return this;
    },
    generate(){
        let random = seededRandom(this.seed)
        const ran_a = Math.floor(random * this.names.length)
        const ran_b = Math.floor(random * this.adjectives.length)
        const ran_suffix = Math.floor(random * 100)
        return `${this.adjectives[ran_b]}${this.separator}${this.names[ran_a]}${ran_suffix}`
    }
}

export default generator;