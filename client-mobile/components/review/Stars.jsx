import { View, Image } from "react-native";

function Stars({ rating = 0, avg = 0, starSize = 18 }) {
  // Use rating if provided, otherwise use avg
  const starRating = rating || avg;
  
  const renderStars = () => {
    const stars = [];
    const starFilled = require('../../assets/images/star-filled.png');
    const starEmpty = require('../../assets/images/star-empty.png');
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Image 
          key={i}
          source={i < Math.round(starRating) ? starFilled : starEmpty}
          style={{ 
            width: starSize, 
            height: starSize, 
            marginRight: 2,
            resizeMode: 'contain'
          }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {renderStars()}
    </View>
  );
}

export default Stars;