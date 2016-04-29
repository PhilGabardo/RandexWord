f = open('dict.js', 'r')
lines = f.read()
lines = lines.split('\n')
myDict = {}
for i in range(1, len(lines)-2):
	line = lines[i]
	line = line[:-1]
	(k, v) = line.split("\": \"")
	k += "\""
	v = "\"" + v
	if k in myDict:
		myDict[k].append(v)
	else:
		myDict[k] = [v]


for k in myDict:
	print k + ","
