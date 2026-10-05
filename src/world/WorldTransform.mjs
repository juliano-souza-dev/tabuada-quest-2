export function transformMatrix(rotation=0,skewX=0,skewY=0,scaleX=1,scaleY=1){
  const r=Number(rotation||0)*Math.PI/180;
  const tx=Math.tan(Number(skewX||0)*Math.PI/180);
  const ty=Math.tan(Number(skewY||0)*Math.PI/180);
  const sx=Math.max(.01,Math.abs(Number(scaleX||1)));
  const sy=Math.max(.01,Math.abs(Number(scaleY||1)));
  const cos=Math.cos(r),sin=Math.sin(r);
  return {
    a:sx*(cos-sin*ty),
    b:sx*(sin+cos*ty),
    c:sy*(cos*tx-sin),
    d:sy*(sin*tx+cos)
  };
}

export function transformVector(matrix,x,y){
  return {x:matrix.a*x+matrix.c*y,y:matrix.b*x+matrix.d*y};
}

export function inverseVector(matrix,x,y){
  const det=matrix.a*matrix.d-matrix.b*matrix.c;
  if(Math.abs(det)<1e-8)return {x:0,y:0};
  return {x:(matrix.d*x-matrix.c*y)/det,y:(matrix.a*y-matrix.b*x)/det};
}
