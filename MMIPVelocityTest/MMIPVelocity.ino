// ---------------------------------------------------------------------------
// NewPing library sketch that interfaces with all but the SRF06 sensor using
// only one Arduino pin. You can also interface with the SRF06 using one pin
// if you install a 0.1uf capacitor on the trigger and echo pins of the sensor
// then tie the trigger pin to the Arduino pin (doesn't work with Teensy).
// ---------------------------------------------------------------------------

#include <NewPing.h>

#define PING_PIN  12  // Arduino pin tied to both trigger and echo pins on the ultrasonic sensor.
#define MAX_DISTANCE 400 // Maximum distance we want to ping for (in centimeters). Maximum sensor distance is rated at 400-500cm.

NewPing sonar(PING_PIN, PING_PIN, MAX_DISTANCE); // NewPing setup of pin and maximum distance.


const int led =  13; 

double personspeed = 0;
int prevdistance = 0;




void setup() {
  Serial.begin(115200); // Open serial monitor at 115200 baud to see ping results.
  // initialize the LED pin as an output:
  pinMode(led, OUTPUT);  

}

void loop() {
  delay(750);                      // Wait 50ms between pings (about 20 pings/sec). 29ms should be the shortest delay between pings.
  int distance = sonar.ping() / US_ROUNDTRIP_CM; // Send ping, get ping time in microseconds (uS).
  Serial.print("Ping: ");
  Serial.print(distance); // Convert ping time to distance and print result (0 = outside set distance range, no ping echo)
  Serial.println();
   
   if (distance > 20) {     
    // turn LED on:    
    //Serial.println("hello");
    digitalWrite(led, HIGH);     
  } 
  else {
    // turn LED off:
    digitalWrite(led, LOW); 
  }
  
 personspeed = prevdistance - distance;
 personspeed = abs(personspeed)/.75;
 prevdistance = distance;  
 Serial.print("personspeed: ");
 Serial.println(personspeed); 
  
  
}
