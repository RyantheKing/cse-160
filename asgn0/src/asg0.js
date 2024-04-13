function main() {
    // Retrieve the <canvas> element
    canvas = document.getElementById('asgn0');
    if (!canvas) {
        console.log('Failed to get the <canvas>');
        return false;
    }

    ctx = canvas.getContext('2d');
    
    // Draw a black canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // instantiate a vector
    // var v1 = new Vector3([2.25, 2.25, 0]);
    // drawVector(v1, 'red');

    // Draw a blue rectangle
    // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set a blue color
    // ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color
}

// // DrawRectangle.js
function drawVector(v, color) {
    // use lineTo() to draw a vector
    let cx = canvas.width/2;
    let cy = canvas.height/2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + v.elements[0]*20, cy - v.elements[1]*20);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent() {
    let x1 = parseFloat(document.getElementById('vector-x1').value);
    let y1 = parseFloat(document.getElementById('vector-y1').value);
    let x2 = parseFloat(document.getElementById('vector-x2').value);
    let y2 = parseFloat(document.getElementById('vector-y2').value);
    let v1 = new Vector3([x1, y1, 0]);
    let v2 = new Vector3([x2, y2, 0]);

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawVector(v1, 'red');
    drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
    let x1 = parseFloat(document.getElementById('vector-x1').value);
    let y1 = parseFloat(document.getElementById('vector-y1').value);
    let x2 = parseFloat(document.getElementById('vector-x2').value);
    let y2 = parseFloat(document.getElementById('vector-y2').value);
    let v1 = new Vector3([x1, y1, 0]);
    let v2 = new Vector3([x2, y2, 0]);

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawVector(v1, 'red');
    drawVector(v2, 'blue');

    let operation = document.getElementById('operation').value;

    if (operation === 'add') {
        let v3 = v1.add(v2);
        drawVector(v3, 'green');
    } else if (operation === 'sub') {
        let v3 = v1.sub(v2);
        drawVector(v3, 'green');
    } else if (operation === 'mul') {
        let scalar = parseFloat(document.getElementById('scalar').value);
        let v3 = v1.mul(scalar);
        let v4 = v2.mul(scalar);
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    } else if (operation === 'div') {
        let scalar = parseFloat(document.getElementById('scalar').value);
        let v3 = v1.div(scalar);
        let v4 = v2.div(scalar);
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    } else if (operation === 'dot') {
        let angle = angleBetween(v1, v2);
        console.log('Angle: ' + angle);
    } else if (operation === 'area') {
        let area = areaTriangle(v1, v2);
        console.log('Area: ' + area);
    } else if (operation === 'mag') {
        let mag1 = v1.magnitude();
        let mag2 = v2.magnitude();
        console.log('Magnitude v1: ' + mag1);
        console.log('Magnitude v2: ' + mag2);
    } else if (operation === 'norm') {
        let v3 = v1.normalize();
        let v4 = v2.normalize();
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    }
    else {
        console.log('Invalid operation');
    }
}

function angleBetween(v1, v2) {
    let dotProduct = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();

    if (mag1 === 0 || mag2 === 0) {
        console.log('One of the vectors has a magnitude of 0');
        return;
    }

    return Math.acos(dotProduct / (mag1 * mag2)) * 180 / Math.PI;
}

function areaTriangle(v1, v2) {
    let crossProduct = Vector3.cross(v1, v2);
    return crossProduct.magnitude() / 2;
}