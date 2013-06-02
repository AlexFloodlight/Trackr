<!DOCTYPE html>
<html>
<head>
<title>Trackr</title>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.0/jquery.min.js"></script>
<script src="scripts.js"></script>
<link rel="stylesheet" href="style.css" />
<link rel="stylesheet" href="icons.css" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

</head>

<body>
	<div class="wrap">
		<div id="the-button">
			<div class="inner grad">Push Me!</div>
		</div>
		<h2>What did you do at:</h2>
		<ul id="list-tasks"></ul>
		<div id="finished">
			<table id="records">
				<thead>
					<th scope="col">Time</th>
					<th scope="col">Task</th>
				</thead>
				<tbody></tbody>
			</table>
		</div>
	</div>
	<audio id="audio-pop">
		<source src="audio/pop.mp3"></source>
		<source src="audio/pop.ogg"></source>
		<source src="audio/pop.wav"></source>
	</audio>
</body>

</html>