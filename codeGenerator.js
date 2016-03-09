/// This file is part of "Lemmings.js" project, which is made available under the terms of the MIT License (MIT). Note the file "LICENSE" for license and warranty information.
/// 
/// The CodeGenerator Class is used to parse and generate Lemmings-Level-Codes like "JLDLCINECR"
///  use:
///    reverseCode(STRING LemmingsCodeStr);
///    createCode(INT levelIndex, INT percent, GAME.VERSION gameVersion)

function CodeGenerator(gameObject)
{
	//---
	//  nibble 0  | nibble 1  | nibble 2  | nibble 3  | nibble 4  | nibble 5  | nibble 6
	// -----------|-----------|-----------|-----------|-----------|-----------|----------
	//  3  2  1  0| 3  2  1  0| 3  2  1  0| 3  2  1  0| 3  2  1  0| 3  2  1  0| 3  2  1  0
	//  8  4  2  1| 8  4  2  1| 8  4  2  1| 8  4  2  1| 8  4  2  1| 8  4  2  1| 8  4  2  1
	//            |           |           |           |           |           |
	//  3  2  1  0| 7  6  5  4|11 10  9  8|15 14 13 12|19 18 17 16|23 22 21 20|27 26 25 24
	//            |           |           |           |           |           |
	// L0 P0 F0 S0|S1 L1  0 P1|S2 L2 P2 F1|S4 S3 P3 L3|P4 S5 L4 F2|S6 P5 F3 L5|L7 L6 0  P6
	//     0  = fixed bitvalue: must be zero, otherwise the code is not accepted!
	//     Ln = level bits: L6 is most significant, L0 is least significant
	//     Pn = previous percentage bits: P6 is most-, P0 is least significant
	//     Sn = spurious bits: S6 is used here as most, S0 as least significant
	//     Fn = previous number of times the level was failed Bits
	//  nibble 7 : least significant bits of level index 
	//  nibble 8 : most significant bits of level index 
	//  nibble 9 : Checksum


	this.codeBase = new Array(7);
	this.codeBase[gameObject.VERSION.LEMMINGS.value] = "AJHLDHBBCJ";
	this.codeBase[gameObject.VERSION.OHNO.value]	 = "AHPTDHBBAD";
	this.codeBase[gameObject.VERSION.HOLIDAY93.value]= "AJHLDHBBAD";
	this.codeBase[gameObject.VERSION.HOLIDAY94.value]= "AJPLDHBBCD";
	this.codeBase[gameObject.VERSION.XMAS91.value]	 = this.codeBase[gameObject.VERSION.LEMMINGS.value]; //- they use the same codebase
	this.codeBase[gameObject.VERSION.XMAS92.value]	 = this.codeBase[gameObject.VERSION.LEMMINGS.value];

	this.game = gameObject;

	var self = this;

	//- result structure
	function codeInfo()
	{
		this.levelIndex = 0;
		this.percent = 100;
		this.lemmingsVersion = null;
		this.failCount = 0;
		this.suprise = 0;
	}

	//- return (codeInfo) from Lemmings-Code.
	this.reverseCode = function(codeString)
	{
		//- check for all know Lemmings Versions
		for (var versionName in gameObject.VERSION)
		{
			var version = gameObject.VERSION[versionName];
			var inf = self.reverseCodeSub(codeString, version);
			if (inf != null) return inf;
		}

		return null;
	}


	
	this.reverseCodeSub = function(codeString, gameVersion)
	{
		if (codeString.length != 10) return null;

		var codeBase = self.codeBase[gameVersion.value];

		//- CodeBase Offsets
		var Ofc = new Array(codeBase.length);
		for (var i = 0; i < codeBase.length; i++)
		{
				Ofc[i] = codeBase.charCodeAt(i);
		}


		//- convert code to int Array
		var code = new Array(10);
		for (var i = 0; i < 10; i++)
		{
				code[i] = codeString.charCodeAt(i);
		}

		//- calculate and check the checksum
		var csum = 0;
		for (var i = 0; i < 9; i++) csum += code[i];

		if ((Ofc[9] + (csum & 0x0F)) != code[9]) return null;

		//- get level Index from code
		var l1 = (code[7] - Ofc[7]);
		var l2 = (code[8] - Ofc[8]);
		if ((l1 < 0) || (l2 < 0) || (l1 > 0x0F) || (l2 > 0x0F)) return null;

		var levelIndex = l1 | (l2 << 4);

		//- unrotate code
		var codeVal = new Array(8);
		codeVal[7] = 0;
		for (var i = 0; i < 7; i++)
		{ 
			var j = (i + 8 - (levelIndex % 8)) % 7;
			codeVal[i] = code[j] - Ofc[i]; 
		}

		//- extract value by bit position
		function generateValue(codeValue, bitPosList)
		{
			var value = 0;
			for (var i = 0; i < bitPosList.length; i++)
			{
				var pos = bitPosList[i];
				var nibble = codeValue[Math.floor(pos / 4)];
				var bit = (nibble >>> (pos % 4)) & 0x01;
			
				value = value	| (bit << i);
			}

			return value; 
		}

		//- do extract
		var nullValue = generateValue(codeVal, [5, 25]);
		var levelValue = generateValue(codeVal, [3, 6, 10, 12, 17, 20, 26, 27]);
		var persentValue = generateValue(codeVal, [2, 4, 9, 13, 19, 22, 24]);
		var supriseValue = generateValue(codeVal, [0, 7, 11, 14, 15, 18, 23]);
		var failValue = generateValue(codeVal, [1, 8, 16, 21]);

		if (nullValue != 0) return null;
		if (levelValue != levelIndex) return null;

		var ret = new codeInfo();

		ret.levelIndex = levelValue;
		ret.percent = persentValue;
		ret.lemmingsVersion = gameVersion;
		ret.failCount = failValue;
		ret.suprise = supriseValue;

		return ret;
	}


	this.createCode = function(levelIndex, percent, gameVersion)
	{
		//- ToDo: refactor this function using 8 bit for Lbit.

		if (typeof gameVersion === "undefined") gameVersion = self.game.VERSION.LEMMINGS;
		if (typeof percent === "undefined") percent = 100;

		var result = new Array(9);
		var Lbit = [3, 2, 2, 0, 1, 0, 2]; //- where to place the Level bits in result
		var Pbit = [2, 0, 1, 1, 3, 2, 0]; //- where to place the Percentage bits in result

		//- CodeBase Offsets
		var codeBase = self.codeBase[gameVersion.value];
		var Ofc = new Array(codeBase.length);
		for (var i = 0; i < codeBase.length; i++)
		{
			Ofc[i] = codeBase.charCodeAt(i);
		}

		//- bit selector
		var bitmask = 1;

		for (var j = 0; j < 7; j++)
		{
			//- add level bit
			var nibble = (levelIndex & bitmask) << Lbit[j];
	 
			//- add percent bit
			nibble = nibble + ((percent & bitmask) << Pbit[j]);

			//- rotate the order
			var i = (j + 8 - (levelIndex % 8)) % 7;

			//- assemble the rotated character
			result[i] = Ofc[j] + (nibble >>> j);

			// next bit
			bitmask = bitmask << 1;
		}


		//- add level characters 
		result[7] = Ofc[7] + ((levelIndex & 0x0F));
		result[8] = Ofc[8] + ((levelIndex & 0xF0) >>> 4);

		//- calculating the checksum
		var csum = 0;
		for (var i = 0; i < 9; i++) csum += result[i];

		//- add checksum
		result[9] = Ofc[9] + (csum & 0x0F);

		//- combine all characters to a proper level string
		var Levelcode = "";
		for (var i = 0; i < 10; i++)
		{
			Levelcode += String.fromCharCode(result[i]);
		}

		return Levelcode;
	} 

}