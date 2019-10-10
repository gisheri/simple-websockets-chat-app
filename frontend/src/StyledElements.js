import styled from "styled-components"
import randomColor from "randomcolor" 

export const Header = styled.div`
    padding:10px;
    text-align:right;
    color: ${props=>randomColor({luminosity: "light", seed: props.connectionId})};
`

export const UserBlock = styled.div`
  background-color:#25282f;
  color:  ${props=>randomColor({luminosity: "light", seed: props.connectionId})};

  padding:10px;
  margin-bottom:5px;
  text-align:left;
`

export const Inputs = styled.div`

`

export const PrevInput = styled.div`
  width:70%;
  padding:5px;
  display:inline-block;
  background:transparent;
  border:none;
  font-size:1em;
  text-align:right;
  box-sizing:border-box;
  overflow:hidden;
  height:30px;
  vertical-align:middle;
  font-weight:bold;
`

export const NextInputContainer = styled.div`
    position: relative;
    width:25%;
    background:rgba(0,0,0,0.2);
    display:inline-block;
    vertical-align:middle;
    border-radius:3px;
`

export const Username = styled.div`
    position:absolute;
    right:10px; top:5px;
    font-weight:bold;
`

export const NextInput = styled.input`
  padding:5px;
  background: transparent;
  border:none;
  font-size:1em;
  width:100%;
  box-sizing:border-box;
  font-weight:bold;
  color: inherit;
`