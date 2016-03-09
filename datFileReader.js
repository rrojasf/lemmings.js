/// This file is part of "Lemmings.js" project, which is made available under the terms of the MIT License (MIT). Note the file "LICENSE" for license and warranty information.
/// 
/// The DatFileReader Class is used for uncompressing of ".dat" Files and providing there sections by calling "this.getPart(sectionIndex)".
///

function DatFileReader(gameObject)
{
	///------------------------
	/// Class FilePart
	function FilePart()
	{
		this.offset = 0;
		this.initial_bufferLen = 0;
		this.checksum = 0;
		this.decompressed_size = 0;
		this.compressed_size = 0;
		this.unknown0 = 0;
		this.unknown1 = 0;
	}

	///------------------------
	/// Class BitReader
	function BitReader(fileReader, offset, length, initBufferLength)
	{
		this.fr = new DataReader(fileReader, offset, length, fileReader.filename); //- create a copy of the reader
		this.buffer = this.fr.readByte();
		this.bufferLen = initBufferLength;
		this.checksum = this.buffer;

		var self = this;

		/// read and return [bitCount] bits from the stream
		this.read = function(bitCount) 
		{
			var result = 0;

			for (var i=bitCount; i>0; i--)
			{
				if (self.bufferLen == 0)
				{
					var b = self.fr.readByte();
					self.buffer = b;
					self.checksum ^= b;
					self.bufferLen = 8;
				}

				self.bufferLen--;

				result = (result << 1) | (self.buffer & 1);
				self.buffer >>= 1;
			}

			//console.log("c:"+ bitCount +" len: "+ self.bufferLen +" b: "+ self.buffer +" r: "+ result);

			return result;
		}

		this.eof = function()
		{
			return ((self.bufferLen <= 0) && (self.fr.eof()))
		}
	}

	///------------------------
	/// Class OutWriter
	function OutWriter(bitReader, outLength)
	{
		this.bitReader = bitReader;
		this.outData = new Uint8Array(outLength);
		this.outPos = outLength;
		var self = this;

		this.decode_raw_data = function( length )
		{
			if (length > self.outPos)
			{
				console.log("out of out buffer");
				self.outPos = 0;
				return;
			}
			
			for (; length > 0; length--)
			{
				self.outPos--;
				self.outData[self.outPos] = self.bitReader.read(8);
			}
		}


		this.dereference_data = function(length, offset_bit_count)
		{
			var offset = self.bitReader.read(offset_bit_count) + 1;

			if (self.outPos + offset + length > this.outData.lenght)
			{
				console.log("out of out buffer");
				self.outPos = 0;
				return;
			}

			for (; length > 0; length--)
			{
				self.outPos--;
				self.outData[self.outPos] = self.outData[self.outPos + offset];
			}
		}

		this.getDataReader = function()
		{
			return new DataReader(self.outData);
		}

		this.eof = function()
		{
			return self.outPos <= 0;
		}

	}


	///------------------------
	/// Class DatFileReader

	this.game = gameObject;
	this.parts = new Array();
	this.data = null;

	var self = this;

	///--- read a data File ---///
	this.getPartCount = function()
	{
		return self.parts.length;
	} 

	///--- read a data File ---///
	this.read = function(fileName, doneCallback)
	{
		self.game.fileLoader.load(fileName, function(data) 
		{
			/// the File is stored in reversed order
			data.reverse();
			self.data = data;

			/// we start at the end of the file
			var pos = self.data.length;
			

			while(pos >= 10)
			{
				data.setOffset(pos - 10);

				part = new FilePart();

				/// Read Header of each Part
				var size = data.readWordBE();

				part.unknown0 = data.readWordBE();
				part.compressed_size = size - 10 /// sub sizeof(header)==10

				part.decompressed_size = data.readWordBE();
				part.unknown1 = data.readWordBE();

				part.checksum = data.readByte();
				part.initial_bufferLen = data.readByte();
				part.offset = pos - size;

				if ((part.offset < 0) || (size > 0xFFFFFF) || (size < 10))
				{
					console.log("out of sync "+ data.filename);
					break;
				}

				pos -= size;

				//- add part
				self.parts.push(part);
			}


			if (doneCallback) doneCallback();
		});
	}


	///--- unpack and return a filepart ---///
	this.getPart = function(partIndex)
	{
		if (partIndex < 0 || partIndex >= self.parts.length)
		{
			console.log("DatFileReader.getPart("+ partIndex +") Index out of range!");
			return new DataReader();
		}

		var part = self.parts[partIndex];

		var bitReader = new BitReader(self.data, part.offset, part.compressed_size, part.initial_bufferLen);
		var outBuffer = new OutWriter(bitReader, part.decompressed_size);

		while(!outBuffer.eof())
		{
			if (bitReader.read(1) == 0)
			{
				switch (bitReader.read(1))
				{
					case 0:	// 00
						outBuffer.decode_raw_data(bitReader.read(3) + 1);
						break;
					case 1:	// 01
						outBuffer.dereference_data(2, 8);
						break;
				}
			}
			else
			{
				switch (bitReader.read(2))
				{
					case 0:	// 100
						outBuffer.dereference_data(3, 9);
						break;
					case 1:	// 101
						outBuffer.dereference_data(4, 10);
						break;
					case 2:	// 110
						outBuffer.dereference_data(bitReader.read(8) + 1, 12);
						break;
					case 3:	// 111
						outBuffer.decode_raw_data(bitReader.read(8) + 9);
						break;
				}
			}
		}

		if (part.checksum != bitReader.checksum)
		{
			 console.log("DatFileReader.getPart("+ partIndex +") : Checksum mismatch! "+ self.data.filename);
		}

		

		var outReader = outBuffer.getDataReader();
		outReader.filename = self.data.filename +"["+ partIndex +"]";
		return outReader;
	}

}
