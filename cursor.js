document.captureEvents(Event.MOUSEMOVE);
document.captureEvents(Event.MOUSEDOWN);


document.onmousemove = mousePos();
document.onmousedown = mouseClicked();

var mouseClick;
var keyClicked;

var mouseX = 0;
var mouseY = 0;

function mousePos (e) {

        mouseX = e.pageX; 
        mouseY = e.pageY;


		alert(mouseX);
}