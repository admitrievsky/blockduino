
z.elf:     file format elf32-avr


Disassembly of section .text:

00000000 <__vectors>:
        digitalWrite(2, HIGH);
        digitalWrite(5, LOW);
    	avr_thread_sleep(1000);
        digitalWrite(2, LOW);
        digitalWrite(5, HIGH);
    	switch_count = 1;
   0:	0c 94 52 00 	jmp	0xa4	; 0xa4 <__ctors_end>
   4:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
   8:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
   c:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  10:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  14:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  18:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  1c:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  20:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  24:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  28:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  2c:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  30:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  34:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  38:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  3c:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  40:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  44:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  48:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  4c:	0c 94 6d 02 	jmp	0x4da	; 0x4da <__vector_19>
  50:	0c 94 75 02 	jmp	0x4ea	; 0x4ea <__vector_20>
  54:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  58:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  5c:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  60:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  64:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  68:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  6c:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>
  70:	0c 94 64 00 	jmp	0xc8	; 0xc8 <__bad_interrupt>

00000074 <port_to_mode_PGM>:
  74:	00 00 24 27 2a                                      ..$'*

00000079 <port_to_output_PGM>:
  79:	00 00 25 28 2b                                      ..%(+

0000007e <port_to_input_PGM>:
  7e:	00 00 23 26 29                                      ..#&)

00000083 <digital_pin_to_port_PGM>:
  83:	04 03 04 04 04 04 04 04 02 02 02 02 03 03 03 03     ................

00000093 <digital_pin_to_bit_mask_PGM>:
  93:	01 04 02 04 08 10 20 40 10 20 40 80 40 20 10 80     ...... @. @.@ ..
	...

000000a4 <__ctors_end>:
  a4:	11 24       	eor	r1, r1
  a6:	1f be       	out	0x3f, r1	; 63
  a8:	cf ef       	ldi	r28, 0xFF	; 255
  aa:	d2 e0       	ldi	r29, 0x02	; 2
  ac:	de bf       	out	0x3e, r29	; 62
  ae:	cd bf       	out	0x3d, r28	; 61

000000b0 <__do_clear_bss>:
  b0:	11 e0       	ldi	r17, 0x01	; 1
  b2:	a0 e0       	ldi	r26, 0x00	; 0
  b4:	b1 e0       	ldi	r27, 0x01	; 1
  b6:	01 c0       	rjmp	.+2      	; 0xba <.do_clear_bss_start>

000000b8 <.do_clear_bss_loop>:
  b8:	1d 92       	st	X+, r1

000000ba <.do_clear_bss_start>:
  ba:	ae 3d       	cpi	r26, 0xDE	; 222
  bc:	b1 07       	cpc	r27, r17
  be:	e1 f7       	brne	.-8      	; 0xb8 <.do_clear_bss_loop>
  c0:	0e 94 bd 01 	call	0x37a	; 0x37a <main>
  c4:	0c 94 03 05 	jmp	0xa06	; 0xa06 <_exit>

000000c8 <__bad_interrupt>:
  c8:	0c 94 00 00 	jmp	0	; 0x0 <__vectors>

000000cc <avr_thread_isr_start>:
  cc:	df 93       	push	r29
  ce:	cf 93       	push	r28
  d0:	bf 93       	push	r27
  d2:	af 93       	push	r26
  d4:	9f 93       	push	r25
  d6:	8f 93       	push	r24
  d8:	7f 93       	push	r23
  da:	6f 93       	push	r22
  dc:	5f 93       	push	r21
  de:	4f 93       	push	r20
  e0:	3f 93       	push	r19
  e2:	2f 93       	push	r18
  e4:	1f 93       	push	r17
  e6:	0f 93       	push	r16
  e8:	ff 92       	push	r15
  ea:	ef 92       	push	r14
  ec:	df 92       	push	r13
  ee:	cf 92       	push	r12
  f0:	bf 92       	push	r11
  f2:	af 92       	push	r10
  f4:	9f 92       	push	r9
  f6:	8f 92       	push	r8
  f8:	7f 92       	push	r7
  fa:	6f 92       	push	r6
  fc:	5f 92       	push	r5
  fe:	4f 92       	push	r4
 100:	3f 92       	push	r3
 102:	2f 92       	push	r2
 104:	1f 92       	push	r1
 106:	0f 92       	push	r0
 108:	af b7       	in	r26, 0x3f	; 63
 10a:	a0 68       	ori	r26, 0x80	; 128
 10c:	af 93       	push	r26
 10e:	00 90 ce 01 	lds	r0, 0x01CE
 112:	00 20       	and	r0, r0
 114:	41 f4       	brne	.+16     	; 0x126 <.no_switch_start>
 116:	c0 91 dc 01 	lds	r28, 0x01DC
 11a:	d0 91 dd 01 	lds	r29, 0x01DD
 11e:	ad b7       	in	r26, 0x3d	; 61
 120:	be b7       	in	r27, 0x3e	; 62
 122:	a9 83       	std	Y+1, r26	; 0x01
 124:	ba 83       	std	Y+2, r27	; 0x02

00000126 <.no_switch_start>:
 126:	af 93       	push	r26
 128:	af 93       	push	r26
 12a:	ff 93       	push	r31
 12c:	ef 93       	push	r30
 12e:	cd b7       	in	r28, 0x3d	; 61
 130:	de b7       	in	r29, 0x3e	; 62
 132:	ad a1       	ldd	r26, Y+37	; 0x25
 134:	bc a1       	ldd	r27, Y+36	; 0x24
 136:	ac 83       	std	Y+4, r26	; 0x04
 138:	bb 83       	std	Y+3, r27	; 0x03
 13a:	ef 91       	pop	r30
 13c:	ec a3       	std	Y+36, r30	; 0x24
 13e:	ff 91       	pop	r31
 140:	fd a3       	std	Y+37, r31	; 0x25
 142:	11 24       	eor	r1, r1
 144:	08 95       	ret

00000146 <avr_thread_isr_end>:
 146:	0f 90       	pop	r0
 148:	0f 90       	pop	r0
 14a:	a0 91 ce 01 	lds	r26, 0x01CE
 14e:	aa 23       	and	r26, r26
 150:	b1 f4       	brne	.+44     	; 0x17e <.no_switch_end>
 152:	81 e0       	ldi	r24, 0x01	; 1
 154:	11 24       	eor	r1, r1
 156:	0f b6       	in	r0, 0x3f	; 63
 158:	0f 92       	push	r0
 15a:	f8 94       	cli
 15c:	ca d0       	rcall	.+404    	; 0x2f2 <avr_thread_find_next>
 15e:	0f 90       	pop	r0
 160:	0f be       	out	0x3f, r0	; 63
 162:	c8 2f       	mov	r28, r24
 164:	d9 2f       	mov	r29, r25
 166:	c0 93 dc 01 	sts	0x01DC, r28
 16a:	d0 93 dd 01 	sts	0x01DD, r29
 16e:	a9 81       	ldd	r26, Y+1	; 0x01
 170:	ba 81       	ldd	r27, Y+2	; 0x02
 172:	0f b6       	in	r0, 0x3f	; 63
 174:	f8 94       	cli
 176:	be bf       	out	0x3e, r27	; 62
 178:	ad bf       	out	0x3d, r26	; 61
 17a:	0f be       	out	0x3f, r0	; 63
 17c:	07 c0       	rjmp	.+14     	; 0x18c <.isr_done>

0000017e <.no_switch_end>:
 17e:	11 24       	eor	r1, r1
 180:	0f b6       	in	r0, 0x3f	; 63
 182:	0f 92       	push	r0
 184:	f8 94       	cli
 186:	91 d0       	rcall	.+290    	; 0x2aa <avr_thread_tick_only>
 188:	0f 90       	pop	r0
 18a:	0f be       	out	0x3f, r0	; 63

0000018c <.isr_done>:
 18c:	0f 90       	pop	r0
 18e:	07 98       	cbi	0x00, 7	; 0
 190:	0f be       	out	0x3f, r0	; 63
 192:	0f 90       	pop	r0
 194:	1f 90       	pop	r1
 196:	2f 90       	pop	r2
 198:	3f 90       	pop	r3
 19a:	4f 90       	pop	r4
 19c:	5f 90       	pop	r5
 19e:	6f 90       	pop	r6
 1a0:	7f 90       	pop	r7
 1a2:	8f 90       	pop	r8
 1a4:	9f 90       	pop	r9
 1a6:	af 90       	pop	r10
 1a8:	bf 90       	pop	r11
 1aa:	cf 90       	pop	r12
 1ac:	df 90       	pop	r13
 1ae:	ef 90       	pop	r14
 1b0:	ff 90       	pop	r15
 1b2:	0f 91       	pop	r16
 1b4:	1f 91       	pop	r17
 1b6:	2f 91       	pop	r18
 1b8:	3f 91       	pop	r19
 1ba:	4f 91       	pop	r20
 1bc:	5f 91       	pop	r21
 1be:	6f 91       	pop	r22
 1c0:	7f 91       	pop	r23
 1c2:	8f 91       	pop	r24
 1c4:	9f 91       	pop	r25
 1c6:	af 91       	pop	r26
 1c8:	bf 91       	pop	r27
 1ca:	cf 91       	pop	r28
 1cc:	df 91       	pop	r29
 1ce:	ef 91       	pop	r30
 1d0:	ff 91       	pop	r31
 1d2:	18 95       	reti

000001d4 <avr_thread_idle>:
 1d4:	ff cf       	rjmp	.-2      	; 0x1d4 <avr_thread_idle>

000001d6 <avr_thread_start_at>:
 1d6:	cf 93       	push	r28
 1d8:	df 93       	push	r29
 1da:	fc 01       	movw	r30, r24
 1dc:	10 82       	st	Z, r1
 1de:	c9 01       	movw	r24, r18
 1e0:	84 97       	sbiw	r24, 0x24	; 36
 1e2:	84 0f       	add	r24, r20
 1e4:	95 1f       	adc	r25, r21
 1e6:	92 83       	std	Z+2, r25	; 0x02
 1e8:	81 83       	std	Z+1, r24	; 0x01
 1ea:	ca 01       	movw	r24, r20
 1ec:	82 0f       	add	r24, r18
 1ee:	93 1f       	adc	r25, r19
 1f0:	fc 01       	movw	r30, r24
 1f2:	32 97       	sbiw	r30, 0x02	; 2
 1f4:	70 83       	st	Z, r23
 1f6:	f9 01       	movw	r30, r18
 1f8:	31 97       	sbiw	r30, 0x01	; 1
 1fa:	e4 0f       	add	r30, r20
 1fc:	f5 1f       	adc	r31, r21
 1fe:	60 83       	st	Z, r22
 200:	22 52       	subi	r18, 0x22	; 34
 202:	30 40       	sbci	r19, 0x00	; 0
 204:	24 0f       	add	r18, r20
 206:	35 1f       	adc	r19, r21
 208:	d9 01       	movw	r26, r18
 20a:	20 e2       	ldi	r18, 0x20	; 32
 20c:	ed 01       	movw	r28, r26
 20e:	19 92       	st	Y+, r1
 210:	2a 95       	dec	r18
 212:	e9 f7       	brne	.-6      	; 0x20e <avr_thread_start_at+0x38>
 214:	dc 01       	movw	r26, r24
 216:	16 97       	sbiw	r26, 0x06	; 6
 218:	ec 93       	st	X, r30
 21a:	dc 01       	movw	r26, r24
 21c:	15 97       	sbiw	r26, 0x05	; 5
 21e:	fc 93       	st	X, r31
 220:	2f b7       	in	r18, 0x3f	; 63
 222:	83 97       	sbiw	r24, 0x23	; 35
 224:	20 68       	ori	r18, 0x80	; 128
 226:	fc 01       	movw	r30, r24
 228:	20 83       	st	Z, r18
 22a:	df 91       	pop	r29
 22c:	cf 91       	pop	r28
 22e:	08 95       	ret

00000230 <avr_thread_start>:
 230:	cf 93       	push	r28
 232:	df 93       	push	r29
 234:	ec 01       	movw	r28, r24
 236:	0e 94 eb 00 	call	0x1d6	; 0x1d6 <avr_thread_start_at>
 23a:	2f b7       	in	r18, 0x3f	; 63
 23c:	f8 94       	cli
 23e:	e0 91 dc 01 	lds	r30, 0x01DC
 242:	f0 91 dd 01 	lds	r31, 0x01DD
 246:	83 81       	ldd	r24, Z+3	; 0x03
 248:	94 81       	ldd	r25, Z+4	; 0x04
 24a:	9c 83       	std	Y+4, r25	; 0x04
 24c:	8b 83       	std	Y+3, r24	; 0x03
 24e:	d4 83       	std	Z+4, r29	; 0x04
 250:	c3 83       	std	Z+3, r28	; 0x03
 252:	2f bf       	out	0x3f, r18	; 63
 254:	df 91       	pop	r29
 256:	cf 91       	pop	r28
 258:	08 95       	ret

0000025a <avr_thread_init>:
 25a:	cf 93       	push	r28
 25c:	df 93       	push	r29
 25e:	cf ec       	ldi	r28, 0xCF	; 207
 260:	d1 e0       	ldi	r29, 0x01	; 1
 262:	ce 01       	movw	r24, r28
 264:	6a ee       	ldi	r22, 0xEA	; 234
 266:	70 e0       	ldi	r23, 0x00	; 0
 268:	40 e0       	ldi	r20, 0x00	; 0
 26a:	51 e0       	ldi	r21, 0x01	; 1
 26c:	20 e8       	ldi	r18, 0x80	; 128
 26e:	30 e0       	ldi	r19, 0x00	; 0
 270:	0e 94 eb 00 	call	0x1d6	; 0x1d6 <avr_thread_start_at>
 274:	d0 93 d9 01 	sts	0x01D9, r29
 278:	c0 93 d8 01 	sts	0x01D8, r28
 27c:	d0 93 db 01 	sts	0x01DB, r29
 280:	c0 93 da 01 	sts	0x01DA, r28
 284:	81 ec       	ldi	r24, 0xC1	; 193
 286:	91 e0       	ldi	r25, 0x01	; 1
 288:	90 93 dd 01 	sts	0x01DD, r25
 28c:	80 93 dc 01 	sts	0x01DC, r24
 290:	10 92 c1 01 	sts	0x01C1, r1
 294:	10 92 c3 01 	sts	0x01C3, r1
 298:	10 92 c2 01 	sts	0x01C2, r1
 29c:	90 93 c5 01 	sts	0x01C5, r25
 2a0:	80 93 c4 01 	sts	0x01C4, r24
 2a4:	df 91       	pop	r29
 2a6:	cf 91       	pop	r28
 2a8:	08 95       	ret

000002aa <avr_thread_tick_only>:
 2aa:	e0 91 dc 01 	lds	r30, 0x01DC
 2ae:	f0 91 dd 01 	lds	r31, 0x01DD
 2b2:	23 81       	ldd	r18, Z+3	; 0x03
 2b4:	34 81       	ldd	r19, Z+4	; 0x04
 2b6:	05 c0       	rjmp	.+10     	; 0x2c2 <avr_thread_tick_only+0x18>
 2b8:	83 81       	ldd	r24, Z+3	; 0x03
 2ba:	94 81       	ldd	r25, Z+4	; 0x04
 2bc:	82 17       	cp	r24, r18
 2be:	93 07       	cpc	r25, r19
 2c0:	b9 f0       	breq	.+46     	; 0x2f0 <avr_thread_tick_only+0x46>
 2c2:	03 80       	ldd	r0, Z+3	; 0x03
 2c4:	f4 81       	ldd	r31, Z+4	; 0x04
 2c6:	e0 2d       	mov	r30, r0
 2c8:	80 81       	ld	r24, Z
 2ca:	87 ff       	sbrs	r24, 7
 2cc:	f5 cf       	rjmp	.-22     	; 0x2b8 <avr_thread_tick_only+0xe>
 2ce:	85 81       	ldd	r24, Z+5	; 0x05
 2d0:	96 81       	ldd	r25, Z+6	; 0x06
 2d2:	01 97       	sbiw	r24, 0x01	; 1
 2d4:	96 83       	std	Z+6, r25	; 0x06
 2d6:	85 83       	std	Z+5, r24	; 0x05
 2d8:	85 81       	ldd	r24, Z+5	; 0x05
 2da:	96 81       	ldd	r25, Z+6	; 0x06
 2dc:	00 97       	sbiw	r24, 0x00	; 0
 2de:	61 f7       	brne	.-40     	; 0x2b8 <avr_thread_tick_only+0xe>
 2e0:	80 81       	ld	r24, Z
 2e2:	8e 77       	andi	r24, 0x7E	; 126
 2e4:	80 83       	st	Z, r24
 2e6:	83 81       	ldd	r24, Z+3	; 0x03
 2e8:	94 81       	ldd	r25, Z+4	; 0x04
 2ea:	82 17       	cp	r24, r18
 2ec:	93 07       	cpc	r25, r19
 2ee:	49 f7       	brne	.-46     	; 0x2c2 <avr_thread_tick_only+0x18>
 2f0:	08 95       	ret

000002f2 <avr_thread_find_next>:
 2f2:	a0 91 dc 01 	lds	r26, 0x01DC
 2f6:	b0 91 dd 01 	lds	r27, 0x01DD
 2fa:	fd 01       	movw	r30, r26
 2fc:	20 e0       	ldi	r18, 0x00	; 0
 2fe:	30 e0       	ldi	r19, 0x00	; 0
 300:	03 80       	ldd	r0, Z+3	; 0x03
 302:	f4 81       	ldd	r31, Z+4	; 0x04
 304:	e0 2d       	mov	r30, r0
 306:	88 23       	and	r24, r24
 308:	19 f0       	breq	.+6      	; 0x310 <__stack+0x11>
 30a:	90 81       	ld	r25, Z
 30c:	97 fd       	sbrc	r25, 7
 30e:	14 c0       	rjmp	.+40     	; 0x338 <__stack+0x39>
 310:	90 81       	ld	r25, Z
 312:	90 fd       	sbrc	r25, 0
 314:	03 c0       	rjmp	.+6      	; 0x31c <__stack+0x1d>
 316:	21 15       	cp	r18, r1
 318:	31 05       	cpc	r19, r1
 31a:	e9 f0       	breq	.+58     	; 0x356 <__stack+0x57>
 31c:	63 81       	ldd	r22, Z+3	; 0x03
 31e:	74 81       	ldd	r23, Z+4	; 0x04
 320:	13 96       	adiw	r26, 0x03	; 3
 322:	4d 91       	ld	r20, X+
 324:	5c 91       	ld	r21, X
 326:	14 97       	sbiw	r26, 0x04	; 4
 328:	64 17       	cp	r22, r20
 32a:	75 07       	cpc	r23, r21
 32c:	49 f7       	brne	.-46     	; 0x300 <__stack+0x1>
 32e:	21 15       	cp	r18, r1
 330:	31 05       	cpc	r19, r1
 332:	a9 f0       	breq	.+42     	; 0x35e <__stack+0x5f>
 334:	c9 01       	movw	r24, r18
 336:	08 95       	ret
 338:	45 81       	ldd	r20, Z+5	; 0x05
 33a:	56 81       	ldd	r21, Z+6	; 0x06
 33c:	41 50       	subi	r20, 0x01	; 1
 33e:	50 40       	sbci	r21, 0x00	; 0
 340:	56 83       	std	Z+6, r21	; 0x06
 342:	45 83       	std	Z+5, r20	; 0x05
 344:	45 81       	ldd	r20, Z+5	; 0x05
 346:	56 81       	ldd	r21, Z+6	; 0x06
 348:	41 15       	cp	r20, r1
 34a:	51 05       	cpc	r21, r1
 34c:	09 f7       	brne	.-62     	; 0x310 <__stack+0x11>
 34e:	90 81       	ld	r25, Z
 350:	9e 77       	andi	r25, 0x7E	; 126
 352:	90 83       	st	Z, r25
 354:	dd cf       	rjmp	.-70     	; 0x310 <__stack+0x11>
 356:	88 23       	and	r24, r24
 358:	71 f0       	breq	.+28     	; 0x376 <__stack+0x77>
 35a:	9f 01       	movw	r18, r30
 35c:	df cf       	rjmp	.-66     	; 0x31c <__stack+0x1d>
 35e:	13 96       	adiw	r26, 0x03	; 3
 360:	8d 91       	ld	r24, X+
 362:	9c 91       	ld	r25, X
 364:	14 97       	sbiw	r26, 0x04	; 4
 366:	90 93 d3 01 	sts	0x01D3, r25
 36a:	80 93 d2 01 	sts	0x01D2, r24
 36e:	2f ec       	ldi	r18, 0xCF	; 207
 370:	31 e0       	ldi	r19, 0x01	; 1
 372:	c9 01       	movw	r24, r18
 374:	08 95       	ret
 376:	9f 01       	movw	r18, r30
 378:	da cf       	rjmp	.-76     	; 0x32e <__stack+0x2f>

0000037a <main>:
    }
}


int main(void)
{
 37a:	0f 93       	push	r16
 37c:	1f 93       	push	r17
 37e:	df 93       	push	r29
 380:	cf 93       	push	r28
 382:	cd b7       	in	r28, 0x3d	; 61
 384:	de b7       	in	r29, 0x3e	; 62
 386:	28 97       	sbiw	r28, 0x08	; 8
 388:	0f b6       	in	r0, 0x3f	; 63
 38a:	f8 94       	cli
 38c:	de bf       	out	0x3e, r29	; 62
 38e:	0f be       	out	0x3f, r0	; 63
 390:	cd bf       	out	0x3d, r28	; 61
    pinMode(2, OUTPUT);
 392:	82 e0       	ldi	r24, 0x02	; 2
 394:	61 e0       	ldi	r22, 0x01	; 1
 396:	0e 94 99 02 	call	0x532	; 0x532 <pinMode>
    digitalWrite(2, LOW);
 39a:	82 e0       	ldi	r24, 0x02	; 2
 39c:	60 e0       	ldi	r22, 0x00	; 0
 39e:	0e 94 b5 02 	call	0x56a	; 0x56a <digitalWrite>
    pinMode(15, OUTPUT);
 3a2:	8f e0       	ldi	r24, 0x0F	; 15
 3a4:	61 e0       	ldi	r22, 0x01	; 1
 3a6:	0e 94 99 02 	call	0x532	; 0x532 <pinMode>

    CLKSEL0 |= _BV(EXTE);
 3aa:	80 91 d0 00 	lds	r24, 0x00D0
 3ae:	84 60       	ori	r24, 0x04	; 4
 3b0:	80 93 d0 00 	sts	0x00D0, r24
    CLKSEL0 |= (1<<CLKS);
 3b4:	80 91 d0 00 	lds	r24, 0x00D0
 3b8:	81 60       	ori	r24, 0x01	; 1
 3ba:	80 93 d0 00 	sts	0x00D0, r24
    CLKPR = _BV(CLKPCE);
 3be:	80 e8       	ldi	r24, 0x80	; 128
 3c0:	80 93 61 00 	sts	0x0061, r24
    CLKPR = 0;
 3c4:	10 92 61 00 	sts	0x0061, r1

    // Setup port B as all output.
    PORTC = 0;
 3c8:	18 b8       	out	0x08, r1	; 8
    DDRC = 128;
 3ca:	87 b9       	out	0x07, r24	; 7

    // Setup timer 2 mode.  Include reset on overflow bit.
    // Approximately 1.008 kHz for 4 MHz crystal.
    TCCR0B = _BV(CS01) | _BV(CS00);
 3cc:	83 e0       	ldi	r24, 0x03	; 3
 3ce:	85 bd       	out	0x25, r24	; 37
    OCR0A = 250;
 3d0:	8a ef       	ldi	r24, 0xFA	; 250
 3d2:	87 bd       	out	0x27, r24	; 39
    OCR0B = 255;
 3d4:	8f ef       	ldi	r24, 0xFF	; 255
 3d6:	88 bd       	out	0x28, r24	; 40
    TIMSK0 |= /*_BV(OCIE0A) |*/ _BV(OCIE0B);
 3d8:	80 91 6e 00 	lds	r24, 0x006E
 3dc:	84 60       	ori	r24, 0x04	; 4
 3de:	80 93 6e 00 	sts	0x006E, r24

    // Initialize avr-thread library.
//    avr_thread_init();

    volatile long j=0;
 3e2:	19 82       	std	Y+1, r1	; 0x01
 3e4:	1a 82       	std	Y+2, r1	; 0x02
 3e6:	1b 82       	std	Y+3, r1	; 0x03
 3e8:	1c 82       	std	Y+4, r1	; 0x04
    for(volatile long z=0; z<1000000; z++)
 3ea:	1d 82       	std	Y+5, r1	; 0x05
 3ec:	1e 82       	std	Y+6, r1	; 0x06
 3ee:	1f 82       	std	Y+7, r1	; 0x07
 3f0:	18 86       	std	Y+8, r1	; 0x08
 3f2:	16 c0       	rjmp	.+44     	; 0x420 <main+0xa6>
        j=z+1;
 3f4:	8d 81       	ldd	r24, Y+5	; 0x05
 3f6:	9e 81       	ldd	r25, Y+6	; 0x06
 3f8:	af 81       	ldd	r26, Y+7	; 0x07
 3fa:	b8 85       	ldd	r27, Y+8	; 0x08
 3fc:	01 96       	adiw	r24, 0x01	; 1
 3fe:	a1 1d       	adc	r26, r1
 400:	b1 1d       	adc	r27, r1
 402:	89 83       	std	Y+1, r24	; 0x01
 404:	9a 83       	std	Y+2, r25	; 0x02
 406:	ab 83       	std	Y+3, r26	; 0x03
 408:	bc 83       	std	Y+4, r27	; 0x04

    // Initialize avr-thread library.
//    avr_thread_init();

    volatile long j=0;
    for(volatile long z=0; z<1000000; z++)
 40a:	8d 81       	ldd	r24, Y+5	; 0x05
 40c:	9e 81       	ldd	r25, Y+6	; 0x06
 40e:	af 81       	ldd	r26, Y+7	; 0x07
 410:	b8 85       	ldd	r27, Y+8	; 0x08
 412:	01 96       	adiw	r24, 0x01	; 1
 414:	a1 1d       	adc	r26, r1
 416:	b1 1d       	adc	r27, r1
 418:	8d 83       	std	Y+5, r24	; 0x05
 41a:	9e 83       	std	Y+6, r25	; 0x06
 41c:	af 83       	std	Y+7, r26	; 0x07
 41e:	b8 87       	std	Y+8, r27	; 0x08
 420:	8d 81       	ldd	r24, Y+5	; 0x05
 422:	9e 81       	ldd	r25, Y+6	; 0x06
 424:	af 81       	ldd	r26, Y+7	; 0x07
 426:	b8 85       	ldd	r27, Y+8	; 0x08
 428:	80 34       	cpi	r24, 0x40	; 64
 42a:	22 e4       	ldi	r18, 0x42	; 66
 42c:	92 07       	cpc	r25, r18
 42e:	2f e0       	ldi	r18, 0x0F	; 15
 430:	a2 07       	cpc	r26, r18
 432:	20 e0       	ldi	r18, 0x00	; 0
 434:	b2 07       	cpc	r27, r18
 436:	f4 f2       	brlt	.-68     	; 0x3f4 <main+0x7a>
        j=z+1;

    digitalWrite(2, HIGH);
 438:	82 e0       	ldi	r24, 0x02	; 2
 43a:	61 e0       	ldi	r22, 0x01	; 1
 43c:	0e 94 b5 02 	call	0x56a	; 0x56a <digitalWrite>


    init_servos();
 440:	0e 94 80 04 	call	0x900	; 0x900 <init_servos>

    sei();
 444:	78 94       	sei
    // Start new thread
    avr_thread_start(&fn_context1,
                     fn1, fn_stack1, sizeof(fn_stack1));*/
    for (;;) {
        j++;
        digitalWrite(2, !digitalRead(2));
 446:	14 eb       	ldi	r17, 0xB4	; 180

    // Start new thread
    avr_thread_start(&fn_context1,
                     fn1, fn_stack1, sizeof(fn_stack1));*/
    for (;;) {
        j++;
 448:	89 81       	ldd	r24, Y+1	; 0x01
 44a:	9a 81       	ldd	r25, Y+2	; 0x02
 44c:	ab 81       	ldd	r26, Y+3	; 0x03
 44e:	bc 81       	ldd	r27, Y+4	; 0x04
 450:	01 96       	adiw	r24, 0x01	; 1
 452:	a1 1d       	adc	r26, r1
 454:	b1 1d       	adc	r27, r1
 456:	89 83       	std	Y+1, r24	; 0x01
 458:	9a 83       	std	Y+2, r25	; 0x02
 45a:	ab 83       	std	Y+3, r26	; 0x03
 45c:	bc 83       	std	Y+4, r27	; 0x04
        digitalWrite(2, !digitalRead(2));
 45e:	82 e0       	ldi	r24, 0x02	; 2
 460:	0e 94 d1 02 	call	0x5a2	; 0x5a2 <digitalRead>
 464:	61 e0       	ldi	r22, 0x01	; 1
 466:	00 97       	sbiw	r24, 0x00	; 0
 468:	09 f0       	breq	.+2      	; 0x46c <main+0xf2>
 46a:	60 e0       	ldi	r22, 0x00	; 0
 46c:	82 e0       	ldi	r24, 0x02	; 2
 46e:	0e 94 b5 02 	call	0x56a	; 0x56a <digitalWrite>
 472:	04 eb       	ldi	r16, 0xB4	; 180
        for(int i=0; i<180; i+=2){
            set_servo(6, i);
 474:	61 2f       	mov	r22, r17
 476:	60 1b       	sub	r22, r16
 478:	86 e0       	ldi	r24, 0x06	; 6
 47a:	0e 94 34 03 	call	0x668	; 0x668 <set_servo>
            set_servo(5, 180-i);
 47e:	85 e0       	ldi	r24, 0x05	; 5
 480:	60 2f       	mov	r22, r16
 482:	0e 94 34 03 	call	0x668	; 0x668 <set_servo>
            for(volatile long z=0; z<10000; z++)
 486:	1d 82       	std	Y+5, r1	; 0x05
 488:	1e 82       	std	Y+6, r1	; 0x06
 48a:	1f 82       	std	Y+7, r1	; 0x07
 48c:	18 86       	std	Y+8, r1	; 0x08
 48e:	16 c0       	rjmp	.+44     	; 0x4bc <main+0x142>
                j=z+1;
 490:	8d 81       	ldd	r24, Y+5	; 0x05
 492:	9e 81       	ldd	r25, Y+6	; 0x06
 494:	af 81       	ldd	r26, Y+7	; 0x07
 496:	b8 85       	ldd	r27, Y+8	; 0x08
 498:	01 96       	adiw	r24, 0x01	; 1
 49a:	a1 1d       	adc	r26, r1
 49c:	b1 1d       	adc	r27, r1
 49e:	89 83       	std	Y+1, r24	; 0x01
 4a0:	9a 83       	std	Y+2, r25	; 0x02
 4a2:	ab 83       	std	Y+3, r26	; 0x03
 4a4:	bc 83       	std	Y+4, r27	; 0x04
        j++;
        digitalWrite(2, !digitalRead(2));
        for(int i=0; i<180; i+=2){
            set_servo(6, i);
            set_servo(5, 180-i);
            for(volatile long z=0; z<10000; z++)
 4a6:	8d 81       	ldd	r24, Y+5	; 0x05
 4a8:	9e 81       	ldd	r25, Y+6	; 0x06
 4aa:	af 81       	ldd	r26, Y+7	; 0x07
 4ac:	b8 85       	ldd	r27, Y+8	; 0x08
 4ae:	01 96       	adiw	r24, 0x01	; 1
 4b0:	a1 1d       	adc	r26, r1
 4b2:	b1 1d       	adc	r27, r1
 4b4:	8d 83       	std	Y+5, r24	; 0x05
 4b6:	9e 83       	std	Y+6, r25	; 0x06
 4b8:	af 83       	std	Y+7, r26	; 0x07
 4ba:	b8 87       	std	Y+8, r27	; 0x08
 4bc:	8d 81       	ldd	r24, Y+5	; 0x05
 4be:	9e 81       	ldd	r25, Y+6	; 0x06
 4c0:	af 81       	ldd	r26, Y+7	; 0x07
 4c2:	b8 85       	ldd	r27, Y+8	; 0x08
 4c4:	80 31       	cpi	r24, 0x10	; 16
 4c6:	27 e2       	ldi	r18, 0x27	; 39
 4c8:	92 07       	cpc	r25, r18
 4ca:	20 e0       	ldi	r18, 0x00	; 0
 4cc:	a2 07       	cpc	r26, r18
 4ce:	20 e0       	ldi	r18, 0x00	; 0
 4d0:	b2 07       	cpc	r27, r18
 4d2:	f4 f2       	brlt	.-68     	; 0x490 <main+0x116>
 4d4:	02 50       	subi	r16, 0x02	; 2
    avr_thread_start(&fn_context1,
                     fn1, fn_stack1, sizeof(fn_stack1));*/
    for (;;) {
        j++;
        digitalWrite(2, !digitalRead(2));
        for(int i=0; i<180; i+=2){
 4d6:	71 f6       	brne	.-100    	; 0x474 <main+0xfa>
 4d8:	b7 cf       	rjmp	.-146    	; 0x448 <main+0xce>

000004da <__vector_19>:
}


ISR(TIMER0_COMPA_vect, ISR_NAKED)
{
    sei();
 4da:	78 94       	sei
    avr_thread_isr_start();
 4dc:	0e 94 66 00 	call	0xcc	; 0xcc <avr_thread_isr_start>
    OCR0A += 250;
 4e0:	87 b5       	in	r24, 0x27	; 39
 4e2:	86 50       	subi	r24, 0x06	; 6
 4e4:	87 bd       	out	0x27, r24	; 39
    avr_thread_isr_end();
 4e6:	0e 94 a3 00 	call	0x146	; 0x146 <avr_thread_isr_end>

000004ea <__vector_20>:
}



ISR(TIMER0_COMPB_vect)
{
 4ea:	1f 92       	push	r1
 4ec:	0f 92       	push	r0
 4ee:	0f b6       	in	r0, 0x3f	; 63
 4f0:	0f 92       	push	r0
 4f2:	11 24       	eor	r1, r1
 4f4:	2f 93       	push	r18
 4f6:	3f 93       	push	r19
 4f8:	4f 93       	push	r20
 4fa:	5f 93       	push	r21
 4fc:	6f 93       	push	r22
 4fe:	7f 93       	push	r23
 500:	8f 93       	push	r24
 502:	9f 93       	push	r25
 504:	af 93       	push	r26
 506:	bf 93       	push	r27
 508:	ef 93       	push	r30
 50a:	ff 93       	push	r31
//    cli();for(;;);
    servo_timer();
 50c:	0e 94 b4 03 	call	0x768	; 0x768 <servo_timer>
}
 510:	ff 91       	pop	r31
 512:	ef 91       	pop	r30
 514:	bf 91       	pop	r27
 516:	af 91       	pop	r26
 518:	9f 91       	pop	r25
 51a:	8f 91       	pop	r24
 51c:	7f 91       	pop	r23
 51e:	6f 91       	pop	r22
 520:	5f 91       	pop	r21
 522:	4f 91       	pop	r20
 524:	3f 91       	pop	r19
 526:	2f 91       	pop	r18
 528:	0f 90       	pop	r0
 52a:	0f be       	out	0x3f, r0	; 63
 52c:	0f 90       	pop	r0
 52e:	1f 90       	pop	r1
 530:	18 95       	reti

00000532 <pinMode>:
#include "wiring.h"
#include "pins_arduino.h"

void pinMode(uint8_t pin, uint8_t mode)
{
	uint8_t bit = digitalPinToBitMask(pin);
 532:	90 e0       	ldi	r25, 0x00	; 0
 534:	fc 01       	movw	r30, r24
 536:	ed 56       	subi	r30, 0x6D	; 109
 538:	ff 4f       	sbci	r31, 0xFF	; 255
 53a:	24 91       	lpm	r18, Z+
	uint8_t port = digitalPinToPort(pin);
 53c:	fc 01       	movw	r30, r24
 53e:	ed 57       	subi	r30, 0x7D	; 125
 540:	ff 4f       	sbci	r31, 0xFF	; 255
 542:	e4 91       	lpm	r30, Z+
	volatile uint8_t *reg;

	if (port == NOT_A_PIN) return;
 544:	ee 23       	and	r30, r30
 546:	81 f0       	breq	.+32     	; 0x568 <pinMode+0x36>

	// JWS: can I let the optimizer do this?
	reg = portModeRegister(port);
 548:	f0 e0       	ldi	r31, 0x00	; 0
 54a:	ec 58       	subi	r30, 0x8C	; 140
 54c:	ff 4f       	sbci	r31, 0xFF	; 255
 54e:	85 91       	lpm	r24, Z+
 550:	94 91       	lpm	r25, Z+
 552:	dc 01       	movw	r26, r24

	if (mode == INPUT) *reg &= ~bit;
 554:	66 23       	and	r22, r22
 556:	29 f4       	brne	.+10     	; 0x562 <pinMode+0x30>
 558:	8c 91       	ld	r24, X
 55a:	20 95       	com	r18
 55c:	82 23       	and	r24, r18
 55e:	8c 93       	st	X, r24
 560:	08 95       	ret
	else *reg |= bit;
 562:	8c 91       	ld	r24, X
 564:	82 2b       	or	r24, r18
 566:	8c 93       	st	X, r24
 568:	08 95       	ret

0000056a <digitalWrite>:
}


void digitalWrite(uint8_t pin, uint8_t val)
{
	uint8_t timer = digitalPinToTimer(pin);
 56a:	90 e0       	ldi	r25, 0x00	; 0
	uint8_t bit = digitalPinToBitMask(pin);
 56c:	fc 01       	movw	r30, r24
 56e:	ed 56       	subi	r30, 0x6D	; 109
 570:	ff 4f       	sbci	r31, 0xFF	; 255
 572:	24 91       	lpm	r18, Z+
	uint8_t port = digitalPinToPort(pin);
 574:	fc 01       	movw	r30, r24
 576:	ed 57       	subi	r30, 0x7D	; 125
 578:	ff 4f       	sbci	r31, 0xFF	; 255
 57a:	e4 91       	lpm	r30, Z+
	volatile uint8_t *out;

	if (port == NOT_A_PIN) return;
 57c:	ee 23       	and	r30, r30
 57e:	81 f0       	breq	.+32     	; 0x5a0 <digitalWrite+0x36>

	out = portOutputRegister(port);
 580:	f0 e0       	ldi	r31, 0x00	; 0
 582:	e7 58       	subi	r30, 0x87	; 135
 584:	ff 4f       	sbci	r31, 0xFF	; 255
 586:	85 91       	lpm	r24, Z+
 588:	94 91       	lpm	r25, Z+
 58a:	dc 01       	movw	r26, r24

	if (val == LOW) *out &= ~bit;
 58c:	66 23       	and	r22, r22
 58e:	29 f4       	brne	.+10     	; 0x59a <digitalWrite+0x30>
 590:	8c 91       	ld	r24, X
 592:	20 95       	com	r18
 594:	82 23       	and	r24, r18
 596:	8c 93       	st	X, r24
 598:	08 95       	ret
	else *out |= bit;
 59a:	8c 91       	ld	r24, X
 59c:	82 2b       	or	r24, r18
 59e:	8c 93       	st	X, r24
 5a0:	08 95       	ret

000005a2 <digitalRead>:
}

int digitalRead(uint8_t pin)
{
	uint8_t timer = digitalPinToTimer(pin);
 5a2:	90 e0       	ldi	r25, 0x00	; 0
	uint8_t bit = digitalPinToBitMask(pin);
 5a4:	fc 01       	movw	r30, r24
 5a6:	ed 56       	subi	r30, 0x6D	; 109
 5a8:	ff 4f       	sbci	r31, 0xFF	; 255
 5aa:	24 91       	lpm	r18, Z+
	uint8_t port = digitalPinToPort(pin);
 5ac:	fc 01       	movw	r30, r24
 5ae:	ed 57       	subi	r30, 0x7D	; 125
 5b0:	ff 4f       	sbci	r31, 0xFF	; 255
 5b2:	e4 91       	lpm	r30, Z+

	if (port == NOT_A_PIN) return LOW;
 5b4:	ee 23       	and	r30, r30
 5b6:	59 f0       	breq	.+22     	; 0x5ce <digitalRead+0x2c>

	if (*portInputRegister(port) & bit) return HIGH;
 5b8:	f0 e0       	ldi	r31, 0x00	; 0
 5ba:	e2 58       	subi	r30, 0x82	; 130
 5bc:	ff 4f       	sbci	r31, 0xFF	; 255
 5be:	85 91       	lpm	r24, Z+
 5c0:	94 91       	lpm	r25, Z+
 5c2:	dc 01       	movw	r26, r24
 5c4:	8c 91       	ld	r24, X
 5c6:	82 23       	and	r24, r18
{
	uint8_t timer = digitalPinToTimer(pin);
	uint8_t bit = digitalPinToBitMask(pin);
	uint8_t port = digitalPinToPort(pin);

	if (port == NOT_A_PIN) return LOW;
 5c8:	21 e0       	ldi	r18, 0x01	; 1
 5ca:	30 e0       	ldi	r19, 0x00	; 0
 5cc:	11 f4       	brne	.+4      	; 0x5d2 <digitalRead+0x30>
 5ce:	20 e0       	ldi	r18, 0x00	; 0
 5d0:	30 e0       	ldi	r19, 0x00	; 0

	if (*portInputRegister(port) & bit) return HIGH;
	return LOW;
}
 5d2:	c9 01       	movw	r24, r18
 5d4:	08 95       	ret

000005d6 <map>:


long map(long x, long in_min, long in_max, long out_min, long out_max)
{
 5d6:	2f 92       	push	r2
 5d8:	3f 92       	push	r3
 5da:	4f 92       	push	r4
 5dc:	5f 92       	push	r5
 5de:	6f 92       	push	r6
 5e0:	7f 92       	push	r7
 5e2:	8f 92       	push	r8
 5e4:	9f 92       	push	r9
 5e6:	af 92       	push	r10
 5e8:	bf 92       	push	r11
 5ea:	cf 92       	push	r12
 5ec:	df 92       	push	r13
 5ee:	ef 92       	push	r14
 5f0:	ff 92       	push	r15
 5f2:	0f 93       	push	r16
 5f4:	1f 93       	push	r17
 5f6:	df 93       	push	r29
 5f8:	cf 93       	push	r28
 5fa:	cd b7       	in	r28, 0x3d	; 61
 5fc:	de b7       	in	r29, 0x3e	; 62
 5fe:	3b 01       	movw	r6, r22
 600:	4c 01       	movw	r8, r24
 602:	19 01       	movw	r2, r18
 604:	2a 01       	movw	r4, r20
 606:	6d 89       	ldd	r22, Y+21	; 0x15
 608:	7e 89       	ldd	r23, Y+22	; 0x16
 60a:	8f 89       	ldd	r24, Y+23	; 0x17
 60c:	98 8d       	ldd	r25, Y+24	; 0x18
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
 60e:	6a 19       	sub	r22, r10
 610:	7b 09       	sbc	r23, r11
 612:	8c 09       	sbc	r24, r12
 614:	9d 09       	sbc	r25, r13
 616:	62 1a       	sub	r6, r18
 618:	73 0a       	sbc	r7, r19
 61a:	84 0a       	sbc	r8, r20
 61c:	95 0a       	sbc	r9, r21
 61e:	a4 01       	movw	r20, r8
 620:	93 01       	movw	r18, r6
 622:	0e 94 ad 04 	call	0x95a	; 0x95a <__mulsi3>
 626:	a8 01       	movw	r20, r16
 628:	97 01       	movw	r18, r14
 62a:	22 19       	sub	r18, r2
 62c:	33 09       	sbc	r19, r3
 62e:	44 09       	sbc	r20, r4
 630:	55 09       	sbc	r21, r5
 632:	0e 94 c6 04 	call	0x98c	; 0x98c <__divmodsi4>
 636:	2a 0d       	add	r18, r10
 638:	3b 1d       	adc	r19, r11
 63a:	4c 1d       	adc	r20, r12
 63c:	5d 1d       	adc	r21, r13
}
 63e:	b9 01       	movw	r22, r18
 640:	ca 01       	movw	r24, r20
 642:	cf 91       	pop	r28
 644:	df 91       	pop	r29
 646:	1f 91       	pop	r17
 648:	0f 91       	pop	r16
 64a:	ff 90       	pop	r15
 64c:	ef 90       	pop	r14
 64e:	df 90       	pop	r13
 650:	cf 90       	pop	r12
 652:	bf 90       	pop	r11
 654:	af 90       	pop	r10
 656:	9f 90       	pop	r9
 658:	8f 90       	pop	r8
 65a:	7f 90       	pop	r7
 65c:	6f 90       	pop	r6
 65e:	5f 90       	pop	r5
 660:	4f 90       	pop	r4
 662:	3f 90       	pop	r3
 664:	2f 90       	pop	r2
 666:	08 95       	ret

00000668 <set_servo>:

Servo servos[SERVO_NUM];


void set_servo(uint8_t channel, uint8_t deg)
{
 668:	af 92       	push	r10
 66a:	bf 92       	push	r11
 66c:	cf 92       	push	r12
 66e:	df 92       	push	r13
 670:	ef 92       	push	r14
 672:	ff 92       	push	r15
 674:	0f 93       	push	r16
 676:	1f 93       	push	r17
 678:	df 93       	push	r29
 67a:	cf 93       	push	r28
 67c:	00 d0       	rcall	.+0      	; 0x67e <set_servo+0x16>
 67e:	00 d0       	rcall	.+0      	; 0x680 <set_servo+0x18>
 680:	cd b7       	in	r28, 0x3d	; 61
 682:	de b7       	in	r29, 0x3e	; 62
 684:	8b 83       	std	Y+3, r24	; 0x03
 686:	6c 83       	std	Y+4, r22	; 0x04
	uint16_t period = usToTicks(map(deg, 0, 180, MIN_PULSE_WIDTH, MAX_PULSE_WIDTH));
 688:	8c 81       	ldd	r24, Y+4	; 0x04
 68a:	88 2f       	mov	r24, r24
 68c:	90 e0       	ldi	r25, 0x00	; 0
 68e:	a0 e0       	ldi	r26, 0x00	; 0
 690:	b0 e0       	ldi	r27, 0x00	; 0
 692:	00 d0       	rcall	.+0      	; 0x694 <set_servo+0x2c>
 694:	00 d0       	rcall	.+0      	; 0x696 <set_servo+0x2e>
 696:	6d b7       	in	r22, 0x3d	; 61
 698:	7e b7       	in	r23, 0x3e	; 62
 69a:	6f 5f       	subi	r22, 0xFF	; 255
 69c:	7f 4f       	sbci	r23, 0xFF	; 255
 69e:	20 e6       	ldi	r18, 0x60	; 96
 6a0:	39 e0       	ldi	r19, 0x09	; 9
 6a2:	40 e0       	ldi	r20, 0x00	; 0
 6a4:	50 e0       	ldi	r21, 0x00	; 0
 6a6:	fb 01       	movw	r30, r22
 6a8:	20 83       	st	Z, r18
 6aa:	31 83       	std	Z+1, r19	; 0x01
 6ac:	42 83       	std	Z+2, r20	; 0x02
 6ae:	53 83       	std	Z+3, r21	; 0x03
 6b0:	bc 01       	movw	r22, r24
 6b2:	cd 01       	movw	r24, r26
 6b4:	20 e0       	ldi	r18, 0x00	; 0
 6b6:	30 e0       	ldi	r19, 0x00	; 0
 6b8:	a9 01       	movw	r20, r18
 6ba:	0f 2e       	mov	r0, r31
 6bc:	f4 eb       	ldi	r31, 0xB4	; 180
 6be:	ef 2e       	mov	r14, r31
 6c0:	f0 e0       	ldi	r31, 0x00	; 0
 6c2:	ff 2e       	mov	r15, r31
 6c4:	f0 e0       	ldi	r31, 0x00	; 0
 6c6:	0f 2f       	mov	r16, r31
 6c8:	f0 e0       	ldi	r31, 0x00	; 0
 6ca:	1f 2f       	mov	r17, r31
 6cc:	f0 2d       	mov	r31, r0
 6ce:	0f 2e       	mov	r0, r31
 6d0:	f0 e2       	ldi	r31, 0x20	; 32
 6d2:	af 2e       	mov	r10, r31
 6d4:	f2 e0       	ldi	r31, 0x02	; 2
 6d6:	bf 2e       	mov	r11, r31
 6d8:	f0 e0       	ldi	r31, 0x00	; 0
 6da:	cf 2e       	mov	r12, r31
 6dc:	f0 e0       	ldi	r31, 0x00	; 0
 6de:	df 2e       	mov	r13, r31
 6e0:	f0 2d       	mov	r31, r0
 6e2:	0e 94 eb 02 	call	0x5d6	; 0x5d6 <map>
 6e6:	0f 90       	pop	r0
 6e8:	0f 90       	pop	r0
 6ea:	0f 90       	pop	r0
 6ec:	0f 90       	pop	r0
 6ee:	dc 01       	movw	r26, r24
 6f0:	cb 01       	movw	r24, r22
 6f2:	88 0f       	add	r24, r24
 6f4:	99 1f       	adc	r25, r25
 6f6:	aa 1f       	adc	r26, r26
 6f8:	bb 1f       	adc	r27, r27
 6fa:	88 0f       	add	r24, r24
 6fc:	99 1f       	adc	r25, r25
 6fe:	aa 1f       	adc	r26, r26
 700:	bb 1f       	adc	r27, r27
 702:	88 0f       	add	r24, r24
 704:	99 1f       	adc	r25, r25
 706:	aa 1f       	adc	r26, r26
 708:	bb 1f       	adc	r27, r27
 70a:	88 0f       	add	r24, r24
 70c:	99 1f       	adc	r25, r25
 70e:	aa 1f       	adc	r26, r26
 710:	bb 1f       	adc	r27, r27
 712:	68 94       	set
 714:	15 f8       	bld	r1, 5
 716:	b6 95       	lsr	r27
 718:	a7 95       	ror	r26
 71a:	97 95       	ror	r25
 71c:	87 95       	ror	r24
 71e:	16 94       	lsr	r1
 720:	d1 f7       	brne	.-12     	; 0x716 <set_servo+0xae>
 722:	9a 83       	std	Y+2, r25	; 0x02
 724:	89 83       	std	Y+1, r24	; 0x01
	servos[channel].period = period;
 726:	8b 81       	ldd	r24, Y+3	; 0x03
 728:	88 2f       	mov	r24, r24
 72a:	90 e0       	ldi	r25, 0x00	; 0
 72c:	88 0f       	add	r24, r24
 72e:	99 1f       	adc	r25, r25
 730:	88 0f       	add	r24, r24
 732:	99 1f       	adc	r25, r25
 734:	8d 57       	subi	r24, 0x7D	; 125
 736:	9e 4f       	sbci	r25, 0xFE	; 254
 738:	29 81       	ldd	r18, Y+1	; 0x01
 73a:	3a 81       	ldd	r19, Y+2	; 0x02
 73c:	fc 01       	movw	r30, r24
 73e:	31 83       	std	Z+1, r19	; 0x01
 740:	20 83       	st	Z, r18
	pinMode(channel, OUTPUT);
 742:	8b 81       	ldd	r24, Y+3	; 0x03
 744:	61 e0       	ldi	r22, 0x01	; 1
 746:	0e 94 99 02 	call	0x532	; 0x532 <pinMode>
}
 74a:	0f 90       	pop	r0
 74c:	0f 90       	pop	r0
 74e:	0f 90       	pop	r0
 750:	0f 90       	pop	r0
 752:	cf 91       	pop	r28
 754:	df 91       	pop	r29
 756:	1f 91       	pop	r17
 758:	0f 91       	pop	r16
 75a:	ff 90       	pop	r15
 75c:	ef 90       	pop	r14
 75e:	df 90       	pop	r13
 760:	cf 90       	pop	r12
 762:	bf 90       	pop	r11
 764:	af 90       	pop	r10
 766:	08 95       	ret

00000768 <servo_timer>:

uint8_t servo_to_substract = 0;

void servo_timer()
{
 768:	df 93       	push	r29
 76a:	cf 93       	push	r28
 76c:	00 d0       	rcall	.+0      	; 0x76e <servo_timer+0x6>
 76e:	00 d0       	rcall	.+0      	; 0x770 <servo_timer+0x8>
 770:	0f 92       	push	r0
 772:	cd b7       	in	r28, 0x3d	; 61
 774:	de b7       	in	r29, 0x3e	; 62
	uint16_t next = 65000;
 776:	88 ee       	ldi	r24, 0xE8	; 232
 778:	9d ef       	ldi	r25, 0xFD	; 253
 77a:	9a 83       	std	Y+2, r25	; 0x02
 77c:	89 83       	std	Y+1, r24	; 0x01
	for(uint8_t i=0; i<SERVO_NUM; i++)
 77e:	1b 82       	std	Y+3, r1	; 0x03
 780:	63 c0       	rjmp	.+198    	; 0x848 <servo_timer+0xe0>
	{
		Servo* s = &(servos[i]);
 782:	8b 81       	ldd	r24, Y+3	; 0x03
 784:	88 2f       	mov	r24, r24
 786:	90 e0       	ldi	r25, 0x00	; 0
 788:	88 0f       	add	r24, r24
 78a:	99 1f       	adc	r25, r25
 78c:	88 0f       	add	r24, r24
 78e:	99 1f       	adc	r25, r25
 790:	8f 57       	subi	r24, 0x7F	; 127
 792:	9e 4f       	sbci	r25, 0xFE	; 254
 794:	9d 83       	std	Y+5, r25	; 0x05
 796:	8c 83       	std	Y+4, r24	; 0x04
		if(s->period != 0xffff){
 798:	8c 81       	ldd	r24, Y+4	; 0x04
 79a:	9d 81       	ldd	r25, Y+5	; 0x05
 79c:	fc 01       	movw	r30, r24
 79e:	82 81       	ldd	r24, Z+2	; 0x02
 7a0:	93 81       	ldd	r25, Z+3	; 0x03
 7a2:	ff ef       	ldi	r31, 0xFF	; 255
 7a4:	8f 3f       	cpi	r24, 0xFF	; 255
 7a6:	9f 07       	cpc	r25, r31
 7a8:	09 f4       	brne	.+2      	; 0x7ac <servo_timer+0x44>
 7aa:	4b c0       	rjmp	.+150    	; 0x842 <servo_timer+0xda>
			s->current -= servo_to_substract;
 7ac:	8c 81       	ldd	r24, Y+4	; 0x04
 7ae:	9d 81       	ldd	r25, Y+5	; 0x05
 7b0:	fc 01       	movw	r30, r24
 7b2:	20 81       	ld	r18, Z
 7b4:	31 81       	ldd	r19, Z+1	; 0x01
 7b6:	80 91 80 01 	lds	r24, 0x0180
 7ba:	88 2f       	mov	r24, r24
 7bc:	90 e0       	ldi	r25, 0x00	; 0
 7be:	28 1b       	sub	r18, r24
 7c0:	39 0b       	sbc	r19, r25
 7c2:	8c 81       	ldd	r24, Y+4	; 0x04
 7c4:	9d 81       	ldd	r25, Y+5	; 0x05
 7c6:	fc 01       	movw	r30, r24
 7c8:	31 83       	std	Z+1, r19	; 0x01
 7ca:	20 83       	st	Z, r18
			if(s->current<5){
 7cc:	8c 81       	ldd	r24, Y+4	; 0x04
 7ce:	9d 81       	ldd	r25, Y+5	; 0x05
 7d0:	fc 01       	movw	r30, r24
 7d2:	80 81       	ld	r24, Z
 7d4:	91 81       	ldd	r25, Z+1	; 0x01
 7d6:	85 30       	cpi	r24, 0x05	; 5
 7d8:	91 05       	cpc	r25, r1
 7da:	30 f5       	brcc	.+76     	; 0x828 <servo_timer+0xc0>
				if(digitalRead(i)){
 7dc:	8b 81       	ldd	r24, Y+3	; 0x03
 7de:	0e 94 d1 02 	call	0x5a2	; 0x5a2 <digitalRead>
 7e2:	00 97       	sbiw	r24, 0x00	; 0
 7e4:	61 f0       	breq	.+24     	; 0x7fe <servo_timer+0x96>
					digitalWrite(i, LOW);
 7e6:	8b 81       	ldd	r24, Y+3	; 0x03
 7e8:	60 e0       	ldi	r22, 0x00	; 0
 7ea:	0e 94 b5 02 	call	0x56a	; 0x56a <digitalWrite>
					s->current = usToTicks(SERVO_FREQ);
 7ee:	8c 81       	ldd	r24, Y+4	; 0x04
 7f0:	9d 81       	ldd	r25, Y+5	; 0x05
 7f2:	2c e4       	ldi	r18, 0x4C	; 76
 7f4:	3d e1       	ldi	r19, 0x1D	; 29
 7f6:	fc 01       	movw	r30, r24
 7f8:	31 83       	std	Z+1, r19	; 0x01
 7fa:	20 83       	st	Z, r18
 7fc:	15 c0       	rjmp	.+42     	; 0x828 <servo_timer+0xc0>
				}else{
					digitalWrite(i, HIGH);
 7fe:	8b 81       	ldd	r24, Y+3	; 0x03
 800:	61 e0       	ldi	r22, 0x01	; 1
 802:	0e 94 b5 02 	call	0x56a	; 0x56a <digitalWrite>
					s->current = servos[i].period;
 806:	8b 81       	ldd	r24, Y+3	; 0x03
 808:	88 2f       	mov	r24, r24
 80a:	90 e0       	ldi	r25, 0x00	; 0
 80c:	88 0f       	add	r24, r24
 80e:	99 1f       	adc	r25, r25
 810:	88 0f       	add	r24, r24
 812:	99 1f       	adc	r25, r25
 814:	8d 57       	subi	r24, 0x7D	; 125
 816:	9e 4f       	sbci	r25, 0xFE	; 254
 818:	fc 01       	movw	r30, r24
 81a:	20 81       	ld	r18, Z
 81c:	31 81       	ldd	r19, Z+1	; 0x01
 81e:	8c 81       	ldd	r24, Y+4	; 0x04
 820:	9d 81       	ldd	r25, Y+5	; 0x05
 822:	fc 01       	movw	r30, r24
 824:	31 83       	std	Z+1, r19	; 0x01
 826:	20 83       	st	Z, r18
				}
			}
			next = (next > s->current ? s->current : next);
 828:	8c 81       	ldd	r24, Y+4	; 0x04
 82a:	9d 81       	ldd	r25, Y+5	; 0x05
 82c:	fc 01       	movw	r30, r24
 82e:	80 81       	ld	r24, Z
 830:	91 81       	ldd	r25, Z+1	; 0x01
 832:	29 81       	ldd	r18, Y+1	; 0x01
 834:	3a 81       	ldd	r19, Y+2	; 0x02
 836:	28 17       	cp	r18, r24
 838:	39 07       	cpc	r19, r25
 83a:	08 f4       	brcc	.+2      	; 0x83e <servo_timer+0xd6>
 83c:	c9 01       	movw	r24, r18
 83e:	9a 83       	std	Y+2, r25	; 0x02
 840:	89 83       	std	Y+1, r24	; 0x01
uint8_t servo_to_substract = 0;

void servo_timer()
{
	uint16_t next = 65000;
	for(uint8_t i=0; i<SERVO_NUM; i++)
 842:	8b 81       	ldd	r24, Y+3	; 0x03
 844:	8f 5f       	subi	r24, 0xFF	; 255
 846:	8b 83       	std	Y+3, r24	; 0x03
 848:	8b 81       	ldd	r24, Y+3	; 0x03
 84a:	80 31       	cpi	r24, 0x10	; 16
 84c:	08 f4       	brcc	.+2      	; 0x850 <servo_timer+0xe8>
 84e:	99 cf       	rjmp	.-206    	; 0x782 <servo_timer+0x1a>
				}
			}
			next = (next > s->current ? s->current : next);
		}
	}
	if(next<2)
 850:	89 81       	ldd	r24, Y+1	; 0x01
 852:	9a 81       	ldd	r25, Y+2	; 0x02
 854:	82 30       	cpi	r24, 0x02	; 2
 856:	91 05       	cpc	r25, r1
 858:	58 f4       	brcc	.+22     	; 0x870 <servo_timer+0x108>
		digitalWrite(2, !digitalRead(2));
 85a:	82 e0       	ldi	r24, 0x02	; 2
 85c:	0e 94 d1 02 	call	0x5a2	; 0x5a2 <digitalRead>
 860:	21 e0       	ldi	r18, 0x01	; 1
 862:	00 97       	sbiw	r24, 0x00	; 0
 864:	09 f0       	breq	.+2      	; 0x868 <servo_timer+0x100>
 866:	20 e0       	ldi	r18, 0x00	; 0
 868:	82 e0       	ldi	r24, 0x02	; 2
 86a:	62 2f       	mov	r22, r18
 86c:	0e 94 b5 02 	call	0x56a	; 0x56a <digitalWrite>

	if(next == 65000){
 870:	89 81       	ldd	r24, Y+1	; 0x01
 872:	9a 81       	ldd	r25, Y+2	; 0x02
 874:	fd ef       	ldi	r31, 0xFD	; 253
 876:	88 3e       	cpi	r24, 0xE8	; 232
 878:	9f 07       	cpc	r25, r31
 87a:	51 f4       	brne	.+20     	; 0x890 <servo_timer+0x128>
		OCR0B += 250;
 87c:	88 e4       	ldi	r24, 0x48	; 72
 87e:	90 e0       	ldi	r25, 0x00	; 0
 880:	28 e4       	ldi	r18, 0x48	; 72
 882:	30 e0       	ldi	r19, 0x00	; 0
 884:	f9 01       	movw	r30, r18
 886:	20 81       	ld	r18, Z
 888:	26 50       	subi	r18, 0x06	; 6
 88a:	fc 01       	movw	r30, r24
 88c:	20 83       	st	Z, r18
		return;
 88e:	30 c0       	rjmp	.+96     	; 0x8f0 <servo_timer+0x188>
	}	
	if(next < 200){
 890:	89 81       	ldd	r24, Y+1	; 0x01
 892:	9a 81       	ldd	r25, Y+2	; 0x02
 894:	88 3c       	cpi	r24, 0xC8	; 200
 896:	91 05       	cpc	r25, r1
 898:	f8 f4       	brcc	.+62     	; 0x8d8 <servo_timer+0x170>
		servo_to_substract = next;
 89a:	89 81       	ldd	r24, Y+1	; 0x01
 89c:	80 93 80 01 	sts	0x0180, r24
		if(next < 2)
 8a0:	89 81       	ldd	r24, Y+1	; 0x01
 8a2:	9a 81       	ldd	r25, Y+2	; 0x02
 8a4:	82 30       	cpi	r24, 0x02	; 2
 8a6:	91 05       	cpc	r25, r1
 8a8:	60 f4       	brcc	.+24     	; 0x8c2 <servo_timer+0x15a>
			OCR0B = TCNT0 + next + 2;
 8aa:	88 e4       	ldi	r24, 0x48	; 72
 8ac:	90 e0       	ldi	r25, 0x00	; 0
 8ae:	26 e4       	ldi	r18, 0x46	; 70
 8b0:	30 e0       	ldi	r19, 0x00	; 0
 8b2:	f9 01       	movw	r30, r18
 8b4:	30 81       	ld	r19, Z
 8b6:	29 81       	ldd	r18, Y+1	; 0x01
 8b8:	23 0f       	add	r18, r19
 8ba:	2e 5f       	subi	r18, 0xFE	; 254
 8bc:	fc 01       	movw	r30, r24
 8be:	20 83       	st	Z, r18
 8c0:	17 c0       	rjmp	.+46     	; 0x8f0 <servo_timer+0x188>
		else
			OCR0B += next;
 8c2:	88 e4       	ldi	r24, 0x48	; 72
 8c4:	90 e0       	ldi	r25, 0x00	; 0
 8c6:	28 e4       	ldi	r18, 0x48	; 72
 8c8:	30 e0       	ldi	r19, 0x00	; 0
 8ca:	f9 01       	movw	r30, r18
 8cc:	30 81       	ld	r19, Z
 8ce:	29 81       	ldd	r18, Y+1	; 0x01
 8d0:	23 0f       	add	r18, r19
 8d2:	fc 01       	movw	r30, r24
 8d4:	20 83       	st	Z, r18
 8d6:	0c c0       	rjmp	.+24     	; 0x8f0 <servo_timer+0x188>
	}else{
	 	servo_to_substract = 200;
 8d8:	88 ec       	ldi	r24, 0xC8	; 200
 8da:	80 93 80 01 	sts	0x0180, r24
	 	OCR0B += 200;
 8de:	88 e4       	ldi	r24, 0x48	; 72
 8e0:	90 e0       	ldi	r25, 0x00	; 0
 8e2:	28 e4       	ldi	r18, 0x48	; 72
 8e4:	30 e0       	ldi	r19, 0x00	; 0
 8e6:	f9 01       	movw	r30, r18
 8e8:	20 81       	ld	r18, Z
 8ea:	28 53       	subi	r18, 0x38	; 56
 8ec:	fc 01       	movw	r30, r24
 8ee:	20 83       	st	Z, r18
	}
}
 8f0:	0f 90       	pop	r0
 8f2:	0f 90       	pop	r0
 8f4:	0f 90       	pop	r0
 8f6:	0f 90       	pop	r0
 8f8:	0f 90       	pop	r0
 8fa:	cf 91       	pop	r28
 8fc:	df 91       	pop	r29
 8fe:	08 95       	ret

00000900 <init_servos>:

void init_servos()
{
 900:	df 93       	push	r29
 902:	cf 93       	push	r28
 904:	0f 92       	push	r0
 906:	cd b7       	in	r28, 0x3d	; 61
 908:	de b7       	in	r29, 0x3e	; 62
	for(uint8_t i=0; i<SERVO_NUM; i++)
 90a:	19 82       	std	Y+1, r1	; 0x01
 90c:	1f c0       	rjmp	.+62     	; 0x94c <init_servos+0x4c>
	{
		servos[i].current = SERVO_FREQ;
 90e:	89 81       	ldd	r24, Y+1	; 0x01
 910:	88 2f       	mov	r24, r24
 912:	90 e0       	ldi	r25, 0x00	; 0
 914:	88 0f       	add	r24, r24
 916:	99 1f       	adc	r25, r25
 918:	88 0f       	add	r24, r24
 91a:	99 1f       	adc	r25, r25
 91c:	8f 57       	subi	r24, 0x7F	; 127
 91e:	9e 4f       	sbci	r25, 0xFE	; 254
 920:	20 e3       	ldi	r18, 0x30	; 48
 922:	35 e7       	ldi	r19, 0x75	; 117
 924:	fc 01       	movw	r30, r24
 926:	31 83       	std	Z+1, r19	; 0x01
 928:	20 83       	st	Z, r18
		servos[i].period = 0xffff;
 92a:	89 81       	ldd	r24, Y+1	; 0x01
 92c:	88 2f       	mov	r24, r24
 92e:	90 e0       	ldi	r25, 0x00	; 0
 930:	88 0f       	add	r24, r24
 932:	99 1f       	adc	r25, r25
 934:	88 0f       	add	r24, r24
 936:	99 1f       	adc	r25, r25
 938:	8d 57       	subi	r24, 0x7D	; 125
 93a:	9e 4f       	sbci	r25, 0xFE	; 254
 93c:	2f ef       	ldi	r18, 0xFF	; 255
 93e:	3f ef       	ldi	r19, 0xFF	; 255
 940:	fc 01       	movw	r30, r24
 942:	31 83       	std	Z+1, r19	; 0x01
 944:	20 83       	st	Z, r18
	}
}

void init_servos()
{
	for(uint8_t i=0; i<SERVO_NUM; i++)
 946:	89 81       	ldd	r24, Y+1	; 0x01
 948:	8f 5f       	subi	r24, 0xFF	; 255
 94a:	89 83       	std	Y+1, r24	; 0x01
 94c:	89 81       	ldd	r24, Y+1	; 0x01
 94e:	80 31       	cpi	r24, 0x10	; 16
 950:	f0 f2       	brcs	.-68     	; 0x90e <init_servos+0xe>
	{
		servos[i].current = SERVO_FREQ;
		servos[i].period = 0xffff;
	}	
}
 952:	0f 90       	pop	r0
 954:	cf 91       	pop	r28
 956:	df 91       	pop	r29
 958:	08 95       	ret

0000095a <__mulsi3>:
 95a:	ff 27       	eor	r31, r31
 95c:	ee 27       	eor	r30, r30
 95e:	bb 27       	eor	r27, r27
 960:	aa 27       	eor	r26, r26

00000962 <__mulsi3_loop>:
 962:	60 ff       	sbrs	r22, 0
 964:	04 c0       	rjmp	.+8      	; 0x96e <__mulsi3_skip1>
 966:	a2 0f       	add	r26, r18
 968:	b3 1f       	adc	r27, r19
 96a:	e4 1f       	adc	r30, r20
 96c:	f5 1f       	adc	r31, r21

0000096e <__mulsi3_skip1>:
 96e:	22 0f       	add	r18, r18
 970:	33 1f       	adc	r19, r19
 972:	44 1f       	adc	r20, r20
 974:	55 1f       	adc	r21, r21
 976:	96 95       	lsr	r25
 978:	87 95       	ror	r24
 97a:	77 95       	ror	r23
 97c:	67 95       	ror	r22
 97e:	89 f7       	brne	.-30     	; 0x962 <__mulsi3_loop>
 980:	00 97       	sbiw	r24, 0x00	; 0
 982:	76 07       	cpc	r23, r22
 984:	71 f7       	brne	.-36     	; 0x962 <__mulsi3_loop>

00000986 <__mulsi3_exit>:
 986:	cf 01       	movw	r24, r30
 988:	bd 01       	movw	r22, r26
 98a:	08 95       	ret

0000098c <__divmodsi4>:
 98c:	97 fb       	bst	r25, 7
 98e:	09 2e       	mov	r0, r25
 990:	05 26       	eor	r0, r21
 992:	0e d0       	rcall	.+28     	; 0x9b0 <__divmodsi4_neg1>
 994:	57 fd       	sbrc	r21, 7
 996:	04 d0       	rcall	.+8      	; 0x9a0 <__divmodsi4_neg2>
 998:	14 d0       	rcall	.+40     	; 0x9c2 <__udivmodsi4>
 99a:	0a d0       	rcall	.+20     	; 0x9b0 <__divmodsi4_neg1>
 99c:	00 1c       	adc	r0, r0
 99e:	38 f4       	brcc	.+14     	; 0x9ae <__divmodsi4_exit>

000009a0 <__divmodsi4_neg2>:
 9a0:	50 95       	com	r21
 9a2:	40 95       	com	r20
 9a4:	30 95       	com	r19
 9a6:	21 95       	neg	r18
 9a8:	3f 4f       	sbci	r19, 0xFF	; 255
 9aa:	4f 4f       	sbci	r20, 0xFF	; 255
 9ac:	5f 4f       	sbci	r21, 0xFF	; 255

000009ae <__divmodsi4_exit>:
 9ae:	08 95       	ret

000009b0 <__divmodsi4_neg1>:
 9b0:	f6 f7       	brtc	.-4      	; 0x9ae <__divmodsi4_exit>
 9b2:	90 95       	com	r25
 9b4:	80 95       	com	r24
 9b6:	70 95       	com	r23
 9b8:	61 95       	neg	r22
 9ba:	7f 4f       	sbci	r23, 0xFF	; 255
 9bc:	8f 4f       	sbci	r24, 0xFF	; 255
 9be:	9f 4f       	sbci	r25, 0xFF	; 255
 9c0:	08 95       	ret

000009c2 <__udivmodsi4>:
 9c2:	a1 e2       	ldi	r26, 0x21	; 33
 9c4:	1a 2e       	mov	r1, r26
 9c6:	aa 1b       	sub	r26, r26
 9c8:	bb 1b       	sub	r27, r27
 9ca:	fd 01       	movw	r30, r26
 9cc:	0d c0       	rjmp	.+26     	; 0x9e8 <__udivmodsi4_ep>

000009ce <__udivmodsi4_loop>:
 9ce:	aa 1f       	adc	r26, r26
 9d0:	bb 1f       	adc	r27, r27
 9d2:	ee 1f       	adc	r30, r30
 9d4:	ff 1f       	adc	r31, r31
 9d6:	a2 17       	cp	r26, r18
 9d8:	b3 07       	cpc	r27, r19
 9da:	e4 07       	cpc	r30, r20
 9dc:	f5 07       	cpc	r31, r21
 9de:	20 f0       	brcs	.+8      	; 0x9e8 <__udivmodsi4_ep>
 9e0:	a2 1b       	sub	r26, r18
 9e2:	b3 0b       	sbc	r27, r19
 9e4:	e4 0b       	sbc	r30, r20
 9e6:	f5 0b       	sbc	r31, r21

000009e8 <__udivmodsi4_ep>:
 9e8:	66 1f       	adc	r22, r22
 9ea:	77 1f       	adc	r23, r23
 9ec:	88 1f       	adc	r24, r24
 9ee:	99 1f       	adc	r25, r25
 9f0:	1a 94       	dec	r1
 9f2:	69 f7       	brne	.-38     	; 0x9ce <__udivmodsi4_loop>
 9f4:	60 95       	com	r22
 9f6:	70 95       	com	r23
 9f8:	80 95       	com	r24
 9fa:	90 95       	com	r25
 9fc:	9b 01       	movw	r18, r22
 9fe:	ac 01       	movw	r20, r24
 a00:	bd 01       	movw	r22, r26
 a02:	cf 01       	movw	r24, r30
 a04:	08 95       	ret

00000a06 <_exit>:
 a06:	f8 94       	cli

00000a08 <__stop_program>:
 a08:	ff cf       	rjmp	.-2      	; 0xa08 <__stop_program>
