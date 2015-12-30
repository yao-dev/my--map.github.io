<?php
if(isset($_POST['place_id'])){
	echo file_get_contents('https://maps.googleapis.com/maps/api/place/details/json?placeid='.$_POST["place_id"].'&key=API_KEY');
}
