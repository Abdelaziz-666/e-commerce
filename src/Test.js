import React from 'react'
import { Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card';
import {Col, Row} from 'react-bootstrap';
const Test = () => {
    let data=  [{
        name:"ahmed",
        age: 16,
        number:"00231533"
    
    },{
        name:"ashraf",
        age: 16,
        number:"00231533"
    
    },{
        name:"amgad",
        age: 16,
        number:"00231533"
    
    },{
        name:"bassam",
        age: 16,
        number:"00231533"
    
    },{
        name:"lol",
        age: 16,
        number:"00231533"
    
    },{
        name:"xd",
        age: 16,
        number:"00231533"
    
    },{
        name:"a",
        age: 16,
        number:"00231533"
    
    },{
        name:"aal",
        age: 16,
        number:"00231533"
    
    },{
        name:"aloi",
        age: 16,
        number:"00231533"
    
    },{
        name:"afhmed",
        age: 16,
        number:"00231533"
    
    },{
        name:"ashmed",
        age: 16,
        number:"00231533"
    
    },]
    







  return (
    <div classname='d-flex' >
         <Row>
{ 
        data.map((h) => (
        
       
            <Col xs={6} sm={4} m={3}  lg={4} >
            <Card style={{ width: '18rem' }} className='ms-3'>
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            {h.name}
       </Card.Text>
       <Card.Text>
            {h.age}
       </Card.Text>
       <Card.Text>
            {h.number}
       </Card.Text>
          <Button variant="primary">Go somewhere</Button>
        </Card.Body>
      </Card>
            </Col>

      

        )
    )

}</Row>







    </div>





        )
    
    

    }



export default Test
