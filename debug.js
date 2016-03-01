
function debugFr(fr)
{
  var r="";
  var i=0;

  fr.setOffset(0);

  while(!fr.eof())
  {
    var v = fr.readByte();
    r += (v + 0x10000).toString(16).substr(-2).toUpperCase() +" ";
    i++;
    if ((i % 16) ==0) r+="\n";
  }

  alert(r);
}