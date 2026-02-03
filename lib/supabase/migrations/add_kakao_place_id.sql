ALTER TABLE restaurants
ADD COLUMN kakao_place_id TEXT UNIQUE;

CREATE INDEX idx_restaurants_kakao_place_id ON restaurants(kakao_place_id);

COMMENT ON COLUMN restaurants.kakao_place_id IS 'Unique identifier from Kakao Maps API';
