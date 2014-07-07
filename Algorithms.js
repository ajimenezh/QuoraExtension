Algorithms = function() {
};

Algorithms.prototype.sort = function(array, callback) {
	if (array.length<=1) {
		callback(null, array);
	}
	else {
		var tmp = array.slice();
		Algorithms.prototype.sort(tmp.splice(0,array.length/2), function(error, v1){
			Algorithms.prototype.sort(array.splice(array.length/2, array.length), function(error, v2) {
				var v3 = [];
				var i = 0; 
				var j = 0;
				while (i<v1.length || j<v2.length) {
					if (i==v1.length) {
						v3.push(v2[j]);
						j = j+1;
						if (j==v2.length) callback(null, v3);
					}
					else if (j==v2.length) {
						v3.push(v1[i]);
						i = i+1;
						if (i==v1.length) callback(null, v3);
					}
					else {
						if (v1[i].score>v2[j].score) {
							v3.push(v1[i]);
							i = i+1;
						}
						else {
							v3.push(v2[j]);
							j = j+1;
						}
					}
				}
			})
		})
	}
};

exports.Algorithms = Algorithms;